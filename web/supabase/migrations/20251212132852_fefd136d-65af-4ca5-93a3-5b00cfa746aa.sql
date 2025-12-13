-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and products (store is public)
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Women', 'women', 'Elegant fashion for women', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800'),
('Men', 'men', 'Sophisticated menswear', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'),
('Accessories', 'accessories', 'Luxury accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
('New Arrivals', 'new-arrivals', 'Latest additions to our collection', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800');

-- Insert sample products
INSERT INTO public.products (name, slug, description, price, original_price, category_id, images, sizes, colors, stock, featured, is_new) VALUES
('Silk Evening Gown', 'silk-evening-gown', 'Exquisite hand-crafted silk evening gown with delicate embroidery. Perfect for special occasions.', 45000, 52000, (SELECT id FROM public.categories WHERE slug = 'women'), ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], ARRAY['XS', 'S', 'M', 'L'], ARRAY['Black', 'Burgundy', 'Navy'], 15, true, false),
('Tailored Wool Blazer', 'tailored-wool-blazer', 'Premium Italian wool blazer with satin lining. Impeccable craftsmanship.', 28000, NULL, (SELECT id FROM public.categories WHERE slug = 'men'), ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Charcoal', 'Navy'], 20, true, false),
('Leather Crossbody Bag', 'leather-crossbody-bag', 'Handcrafted genuine leather crossbody with gold hardware.', 18500, 22000, (SELECT id FROM public.categories WHERE slug = 'accessories'), ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'], ARRAY['One Size'], ARRAY['Tan', 'Black', 'Cream'], 30, true, false),
('Cashmere Wrap Dress', 'cashmere-wrap-dress', 'Luxuriously soft cashmere blend wrap dress. Effortless elegance.', 35000, NULL, (SELECT id FROM public.categories WHERE slug = 'women'), ARRAY['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Camel', 'Grey', 'Black'], 12, false, true),
('Premium Cotton Shirt', 'premium-cotton-shirt', 'Egyptian cotton dress shirt with mother-of-pearl buttons.', 12000, NULL, (SELECT id FROM public.categories WHERE slug = 'men'), ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Light Blue', 'Pink'], 50, false, true),
('Gold Statement Necklace', 'gold-statement-necklace', '18k gold-plated statement necklace. Timeless sophistication.', 8500, 10000, (SELECT id FROM public.categories WHERE slug = 'accessories'), ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], ARRAY['One Size'], ARRAY['Gold'], 25, false, true),
('Velvet Cocktail Dress', 'velvet-cocktail-dress', 'Stunning velvet cocktail dress with subtle shimmer.', 32000, 38000, (SELECT id FROM public.categories WHERE slug = 'women'), ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'], ARRAY['XS', 'S', 'M', 'L'], ARRAY['Emerald', 'Ruby', 'Sapphire'], 18, true, false),
('Italian Leather Belt', 'italian-leather-belt', 'Full-grain Italian leather belt with brushed silver buckle.', 6500, NULL, (SELECT id FROM public.categories WHERE slug = 'accessories'), ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'], ARRAY['S', 'M', 'L'], ARRAY['Brown', 'Black'], 40, false, false);