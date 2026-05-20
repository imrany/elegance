import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Mail, Trash2Icon, Download, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { API_URL } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

// Local types matching your Go structural backend models
interface EmailSubscription {
  id: string;
  email: string;
  created_at: string;
}

// Mock API layer—Replace this with your real axios/fetch configuration path (e.g., `@/lib/api`)
const emailApi = {
  getSubscriptions: async (): Promise<EmailSubscription[]> => {
    const res = await fetch(`${API_URL}/api/email/subscriptions`);
    if (!res.ok) throw new Error("Could not fetch subscriptions list");
    const json = await res.json();
    return json.data;
  },
  unsubscribeEmail: async (email: string): Promise<void> => {
    const res = await fetch(
      `${API_URL}/api/email/unsubscribe/${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok)
      throw new Error("Failed to delete backend subscription record");
  },
};

export default function EmailSubscriptionsAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<EmailSubscription | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch subscriptions hook
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["admin-email-subscriptions"],
    queryFn: emailApi.getSubscriptions,
  });

  // Delete subscription mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (email: string) => {
      await emailApi.unsubscribeEmail(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-email-subscriptions"],
      });
      toast.success("Subscriber successfully removed");
      setIsDeleteDialogOpen(false);
      setSelectedSub(null);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete subscription");
    },
  });

  const handleDeleteConfirm = () => {
    if (selectedSub) {
      deleteSubscriptionMutation.mutate(selectedSub.email);
    }
  };

  // Dynamic filter operation
  const filteredSubs =
    subscriptions?.filter((sub) =>
      sub.email.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  // Helper utility to download records as a clean CSV
  const exportToCSV = () => {
    if (!subscriptions || subscriptions.length === 0) return;
    const headers = ["ID,Email,Subscribed At\n"];
    const rows = subscriptions.map(
      (sub) => `"${sub.id}","${sub.email}","${sub.created_at}"`,
    );
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `newsletter_subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
            Email Subscriptions
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your audience registry and newsletter subscribers
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          disabled={isLoading || !subscriptions || subscriptions.length === 0}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Control Actions & Filtering */}
      {!isLoading && subscriptions && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by subscriber email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total Audience Size:{" "}
            <span className="font-medium text-foreground">
              {subscriptions.length}
            </span>
          </div>
        </div>
      )}

      {/* Subscriptions Grid / Table Layout */}
      <div className="rounded-lg border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Joined Date
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <Spinner className="size-4 animate-spin" />
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No matching subscribers located.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {sub.email.length > 30
                            ? `${sub.email.slice(0, 30)}...`
                            : sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 capitalize border-none"
                        variant="outline"
                      >
                        <UserCheck className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(
                        new Date(sub.created_at),
                        "MMM d, yyyy 'at' h:mm a",
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setSelectedSub(sub);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Safeguard Drop Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Subscription</DialogTitle>
            <DialogDescription>
              Are you completely sure you want to remove this subscriber
              profile? This action will immediately exclude them from global
              newsletter campaigns.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="space-y-2 rounded-md bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm font-medium text-foreground">
              Target Entity Record:
            </p>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {selectedSub?.email}
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteSubscriptionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteSubscriptionMutation.isPending}
            >
              {deleteSubscriptionMutation.isPending
                ? "Removing..."
                : "Confirm Removal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
