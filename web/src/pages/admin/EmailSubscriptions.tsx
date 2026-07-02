import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Mail, UserCheck, MoreVertical, Users } from "lucide-react";
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
import { EmailPayload, EmailSubscription, api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SidePanel, {
  PanelBody,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@/components/common/SidePanel";

export default function EmailSubscriptionsAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<EmailSubscription | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSelectedSub, setIsSelectedSub] = useState(false);

  // Track checked row IDs for dynamic target campaigns
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  // Fetch subscriptions
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["admin-email-subscriptions"],
    queryFn: async () => {
      const data = await api.getEmailSubscriptions();
      return data;
    },
  });

  // Compose / Send Email Mutation
  const composeEmailMutation = useMutation({
    mutationFn: async (payload: EmailPayload) => {
      await api.composeEmail(payload);
    },
    onSuccess: () => {
      setIsSelectedSub(false);
      setIsCustomGroup(false);
      setSelectedIds([]);
      setSelectedSub(null);
      toast.success("Emails successfully pushed to outbound pipeline");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to dispatch outgoing campaign");
    },
  });

  // Remove Subscriber Mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (email: string) => {
      await api.unsubscribeEmail(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-email-subscriptions"],
      });
      // Clear checkbox state if the deleted subscriber was selected
      if (selectedSub) {
        setSelectedIds((prev) => prev.filter((id) => id !== selectedSub.id));
      }
      setIsDeleteDialogOpen(false);
      setSelectedSub(null);
      toast.success("Subscriber successfully removed from your system");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove subscription");
    },
  });

  const handleDeleteConfirm = () => {
    if (selectedSub) {
      deleteSubscriptionMutation.mutate(selectedSub.email);
    }
  };

  // Toggle individual items
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Toggle select all visible items
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSubs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubs.map((sub) => sub.id));
    }
  };

  const filteredSubs =
    subscriptions?.filter((sub) =>
      sub.email.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  const getSelectedEmails = (): string[] => {
    if (isCustomGroup) {
      return (
        subscriptions
          ?.filter((s) => selectedIds.includes(s.id))
          .map((s) => s.email) || []
      );
    }
    return [selectedSub?.email || ""];
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
            Email Subscriptions
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your audience registry and newsletter subscribers
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsCustomGroup(true);
                setSelectedSub(null);
                setIsSelectedSub(true);
              }}
              className="w-full sm:w-auto bg-accent text-accent-foreground"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Selected ({selectedIds.length})
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSelectedIds(filteredSubs.map((s) => s.id));
                setIsCustomGroup(true);
                setIsSelectedSub(true);
              }}
              disabled={isLoading || filteredSubs.length === 0}
              className="w-full sm:w-auto"
            >
              <Users className="mr-2 h-4 w-4" />
              Broadcast All
            </Button>
          )}
        </div>
      </div>

      {/* Control Actions & Filtering Bar */}
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
            Selected:{" "}
            <span className="font-medium text-foreground">
              {selectedIds.length}
            </span>{" "}
            / Total: {subscriptions.length}
          </div>
        </div>
      )}

      {/* Main Subscriptions Table */}
      <div className="rounded-lg border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={
                      filteredSubs.length > 0 &&
                      selectedIds.length === filteredSubs.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
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
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Spinner className="size-4 animate-spin" />
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr
                    key={sub.id}
                    className={`hover:bg-secondary/30 transition-colors ${selectedIds.includes(sub.id) && "bg-secondary/20"}`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(sub.id)}
                        onCheckedChange={() => toggleSelect(sub.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize border-none"
                        variant="outline"
                      >
                        <UserCheck className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(sub.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setIsCustomGroup(false);
                              setSelectedSub(sub);
                              setIsSelectedSub(true);
                            }}
                          >
                            Send Individual Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSub(sub);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            Remove Subscriber
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Compose Panel Wrapper */}
      {isSelectedSub && (
        <SidePanel
          isOpen={isSelectedSub}
          onOpenChange={(open) => {
            setIsSelectedSub(open);
            if (!open) {
              setIsCustomGroup(false);
              setSelectedSub(null);
            }
          }}
        >
          <PanelHeader>
            <PanelTitle>
              {isCustomGroup ? "Send Dynamic Campaign" : "Compose Message"}
            </PanelTitle>
            <PanelDescription>
              {isCustomGroup
                ? `You are broadcasting this message to ${getSelectedEmails().length} selected recipients.`
                : `Sending a direct message to ${selectedSub?.email}`}
            </PanelDescription>
          </PanelHeader>

          <PanelBody>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const subject = formData.get("subject") as string;
                const body = formData.get("body") as string;

                const recipients = getSelectedEmails();
                if (recipients.length === 0) {
                  toast.error("Please pick at least one recipient.");
                  return;
                }

                const payload: EmailPayload = {
                  to: recipients,
                  subject,
                };

                if (/<[a-z][\s\S]*>/i.test(body)) {
                  payload.body_html = body;
                } else {
                  payload.body_text = body;
                }

                composeEmailMutation.mutate(payload);
              }}
              className="flex flex-col gap-6 h-full justify-between"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    To
                  </Label>
                  <Input
                    value={
                      isCustomGroup
                        ? `${getSelectedEmails().length} Targeted Recipients Selected`
                        : selectedSub?.email || ""
                    }
                    disabled
                    className="bg-secondary/50 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Subject Line *
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Enter subject line..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="body"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Message Body *
                  </Label>
                  <Textarea
                    id="body"
                    name="body"
                    placeholder="Type your message text or HTML layout..."
                    rows={12}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSelectedSub(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  {composeEmailMutation.isPending
                    ? "Sending..."
                    : "Dispatch Email"}
                </Button>
              </div>
            </form>
          </PanelBody>
        </SidePanel>
      )}
    </div>
  );
}
