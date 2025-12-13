# 🎨 Luxury Fashion E-Commerce UI Styling Guide

A comprehensive guide to using the custom luxury design system with Tailwind CSS.

---

## 📚 Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Buttons](#buttons)
4. [Cards](#cards)
5. [Links](#links)
6. [Images](#images)
7. [Animations](#animations)
8. [Layout Components](#layout-components)
9. [Complete Examples](#complete-examples)

---

## 🎨 Color System

### Background Colors

```jsx
// Light cream background (main page background)
<div className="bg-background">

// Pure white cards
<div className="bg-card">

// Warm cream sections
<div className="bg-secondary">

// Muted/subtle backgrounds
<div className="bg-muted">

// Rich charcoal black
<div className="bg-primary">

// Gold accent
<div className="bg-accent">
```

### Text Colors

```jsx
// Default text (almost black)
<p className="text-foreground">

// Muted/secondary text
<p className="text-muted-foreground">

// Text on dark backgrounds
<p className="text-primary-foreground">

// Gold text
<p className="text-accent">

// Custom luxury colors
<p className="text-[hsl(var(--gold))]">
<p className="text-[hsl(var(--charcoal))]">
<p className="text-[hsl(var(--taupe))]">
```

### Border Colors

```jsx
// Subtle borders
<div className="border border-border">

// Gold border
<div className="border border-accent">

// Custom borders
<div className="border-[hsl(var(--gold))]">
```

---

## ✍️ Typography

### Luxury Letter Spacing

```jsx
// Wide spacing for headlines (0.2em)
<h1 className="tracking-luxury uppercase">
  EXCLUSIVE COLLECTION
</h1>

// Elegant spacing for subheadings (0.1em)
<h2 className="tracking-elegant">
  New Arrivals
</h2>

// Normal spacing
<p className="tracking-normal">
  Regular body text
</p>
```

### Font Combinations

```jsx
// Headlines with Cormorant Garamond (serif)
<h1 className="font-['Cormorant_Garamond'] text-4xl tracking-luxury">
  LUXURY FASHION
</h1>

// Body with Inter (sans-serif)
<p className="font-['Inter'] text-base">
  Discover our curated collection
</p>
```

### Complete Typography Example

```jsx
<div className="space-y-4">
  {/* Main Headline */}
  <h1 className="text-5xl font-bold tracking-luxury uppercase text-primary">
    SPRING COLLECTION
  </h1>
  
  {/* Subheading */}
  <h2 className="text-2xl tracking-elegant text-muted-foreground">
    Timeless Elegance
  </h2>
  
  {/* Body Text */}
  <p className="text-base text-foreground leading-relaxed">
    Discover our carefully curated selection of premium pieces.
  </p>
</div>
```

---

## 🔘 Buttons

### Luxury Primary Button

```jsx
<button className="btn-luxury bg-primary text-primary-foreground px-8 py-3 rounded-sm uppercase tracking-elegant font-medium hover:shadow-lg transition-shadow">
  Shop Now
</button>
```

**What happens:**
- Gold shimmer overlay on hover (from `.btn-luxury`)
- Shadow increases on hover
- Smooth transitions

### Gold Accent Button

```jsx
<button className="btn-luxury bg-accent text-accent-foreground px-8 py-3 rounded-sm uppercase tracking-elegant font-semibold">
  Add to Cart
</button>
```

### Outlined Luxury Button

```jsx
<button className="btn-luxury border-2 border-primary text-primary px-8 py-3 rounded-sm uppercase tracking-elegant hover:bg-primary hover:text-primary-foreground transition-colors">
  Learn More
</button>
```

### Ghost Button (Minimal)

```jsx
<button className="btn-luxury text-foreground px-6 py-2 hover:text-accent transition-colors">
  View Details
</button>
```

### Button with Gold Gradient

```jsx
<button className="gradient-gold text-white px-8 py-3 rounded-sm uppercase tracking-elegant font-bold shadow-lg hover:shadow-xl transition-shadow">
  Premium Access
</button>
```

---

## 🎴 Cards

### Basic Luxury Card

```jsx
<div className="card-luxury bg-card border border-border rounded-sm p-6 shadow-md">
  <h3 className="text-xl font-semibold mb-2">Product Name</h3>
  <p className="text-muted-foreground">Product description</p>
</div>
```

**Features:**
- Lifts up on hover (`-translate-y-1`)
- Shadow increases (`shadow-xl`)
- Smooth 500ms transition

### Product Card with Image

```jsx
<div className="card-luxury bg-card rounded-sm overflow-hidden">
  {/* Image with zoom effect */}
  <div className="overflow-hidden">
    <img 
      src="/product.jpg" 
      alt="Product" 
      className="img-zoom w-full h-64 object-cover"
    />
  </div>
  
  {/* Content */}
  <div className="p-6">
    <h3 className="text-xl font-semibold tracking-elegant mb-2">
      Silk Evening Gown
    </h3>
    <p className="text-muted-foreground mb-4">
      Elegant and timeless
    </p>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-accent">$499</span>
      <button className="btn-luxury bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm uppercase">
        Shop
      </button>
    </div>
  </div>
</div>
```

### Card with Gold Accent Border

```jsx
<div className="card-luxury bg-card border-2 border-accent rounded-sm p-6 relative">
  {/* Premium Badge */}
  <span className="absolute -top-3 left-6 bg-accent text-accent-foreground px-3 py-1 text-xs uppercase tracking-wide font-bold">
    Featured
  </span>
  
  <h3 className="text-xl font-semibold mt-2">Exclusive Item</h3>
  <p className="text-muted-foreground">Limited edition</p>
</div>
```

---

## 🔗 Links

### Animated Underline Link

```jsx
<a href="#" className="link-underline text-foreground hover:text-accent transition-colors">
  Discover More
</a>
```

**Features:**
- Underline expands from left to right on hover
- Color changes to gold
- 300ms smooth transition

### Navigation Link

```jsx
<a href="#" className="link-underline text-sm uppercase tracking-elegant text-muted-foreground hover:text-foreground">
  Collections
</a>
```

### Gold Link

```jsx
<a href="#" className="link-underline text-accent font-medium">
  View All Products →
</a>
```

---

## 🖼️ Images

### Product Image with Zoom

```jsx
<div className="overflow-hidden rounded-sm">
  <img 
    src="/product.jpg" 
    alt="Product" 
    className="img-zoom w-full h-full object-cover"
  />
</div>
```

**Features:**
- Scales to 105% on hover
- 700ms smooth transition
- Container has `overflow-hidden` to clip the zoom

### Hero Image with Overlay

```jsx
<div className="relative h-screen overflow-hidden">
  <img 
    src="/hero.jpg" 
    alt="Hero" 
    className="img-zoom w-full h-full object-cover"
  />
  
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/40" />
  
  {/* Content */}
  <div className="absolute inset-0 flex items-center justify-center text-center">
    <div className="text-white">
      <h1 className="text-6xl font-bold tracking-luxury uppercase mb-4">
        TIMELESS LUXURY
      </h1>
      <button className="btn-luxury gradient-gold text-white px-8 py-3 rounded-sm uppercase">
        Explore Collection
      </button>
    </div>
  </div>
</div>
```

### Image Grid

```jsx
<div className="grid grid-cols-3 gap-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="overflow-hidden rounded-sm">
      <img 
        src={`/image-${i}.jpg`} 
        className="img-zoom w-full h-64 object-cover" 
      />
    </div>
  ))}
</div>
```

---

## ✨ Animations

### Fade Up Animation

```jsx
// Single element
<div className="animate-fade-up">
  <h1>Welcome</h1>
</div>

// Staggered animations (sequential reveal)
<div className="space-y-4">
  <div className="animate-fade-up delay-100">First item</div>
  <div className="animate-fade-up delay-200">Second item</div>
  <div className="animate-fade-up delay-300">Third item</div>
  <div className="animate-fade-up delay-400">Fourth item</div>
  <div className="animate-fade-up delay-500">Fifth item</div>
</div>
```

**Available delays:** `delay-100`, `delay-200`, `delay-300`, `delay-400`, `delay-500`

### Complete Animated Section

```jsx
<section className="py-20">
  <div className="container mx-auto">
    {/* Animated heading */}
    <h2 className="animate-fade-up text-4xl font-bold tracking-luxury uppercase text-center mb-12">
      NEW ARRIVALS
    </h2>
    
    {/* Animated cards */}
    <div className="grid grid-cols-3 gap-8">
      {products.map((product, i) => (
        <div 
          key={product.id} 
          className={`animate-fade-up delay-${(i + 1) * 100} card-luxury`}
        >
          {/* Card content */}
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## 🏗️ Layout Components

### Navigation Bar

```jsx
<nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo */}
    <a href="/" className="text-2xl font-bold tracking-luxury text-accent">
      LUXURY
    </a>
    
    {/* Links */}
    <div className="flex gap-8">
      {['Collections', 'New', 'Sale'].map((item) => (
        <a 
          key={item}
          href="#" 
          className="link-underline text-sm uppercase tracking-elegant hover:text-accent transition-colors"
        >
          {item}
        </a>
      ))}
    </div>
    
    {/* CTA */}
    <button className="btn-luxury bg-accent text-accent-foreground px-6 py-2 rounded-sm uppercase text-sm font-medium">
      Shop Now
    </button>
  </div>
</nav>
```

### Footer

```jsx
<footer className="bg-primary text-primary-foreground py-16">
  <div className="container mx-auto px-6">
    <div className="grid grid-cols-4 gap-12 mb-12">
      {/* Column 1 */}
      <div>
        <h3 className="text-accent text-xl font-bold tracking-luxury mb-4">
          LUXURY
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Timeless elegance and sophistication
        </p>
      </div>
      
      {/* Column 2 */}
      <div>
        <h4 className="font-semibold mb-4 tracking-elegant">Shop</h4>
        <ul className="space-y-2">
          {['Women', 'Men', 'Accessories'].map((item) => (
            <li key={item}>
              <a href="#" className="link-underline text-sm text-muted-foreground hover:text-accent">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Add more columns */}
    </div>
    
    {/* Bottom bar */}
    <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
      © 2024 Luxury Fashion. All rights reserved.
    </div>
  </div>
</footer>
```

### Sidebar

```jsx
<aside className="bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] w-64 min-h-screen p-6">
  {/* Logo */}
  <div className="mb-8">
    <h2 className="text-[hsl(var(--sidebar-primary))] text-2xl font-bold tracking-luxury">
      MENU
    </h2>
  </div>
  
  {/* Navigation */}
  <nav className="space-y-2">
    {['Dashboard', 'Products', 'Orders', 'Settings'].map((item) => (
      <a
        key={item}
        href="#"
        className="block px-4 py-3 rounded-sm text-sm hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
      >
        {item}
      </a>
    ))}
  </nav>
  
  {/* Gold accent button */}
  <button className="w-full mt-8 gradient-gold text-white py-3 rounded-sm uppercase text-sm font-bold">
    Add Product
  </button>
</aside>
```

---

## 🎯 Complete Examples

### Product Grid Page

```jsx
<div className="min-h-screen bg-background">
  {/* Hero Section */}
  <section className="relative h-[60vh] overflow-hidden mb-16">
    <img 
      src="/hero.jpg" 
      className="img-zoom w-full h-full object-cover" 
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center text-white animate-fade-up">
        <h1 className="text-6xl font-bold tracking-luxury uppercase mb-4">
          NEW SEASON
        </h1>
        <p className="text-xl tracking-elegant mb-8">
          Discover Timeless Elegance
        </p>
        <button className="btn-luxury gradient-gold text-white px-10 py-4 rounded-sm uppercase tracking-elegant font-bold">
          Shop Collection
        </button>
      </div>
    </div>
  </section>
  
  {/* Products Grid */}
  <section className="container mx-auto px-6 py-16">
    <h2 className="text-4xl font-bold tracking-luxury uppercase text-center mb-12 animate-fade-up">
      FEATURED PRODUCTS
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product, i) => (
        <div 
          key={product.id}
          className={`animate-fade-up delay-${Math.min((i + 1) * 100, 500)}`}
        >
          <div className="card-luxury bg-card rounded-sm overflow-hidden">
            <div className="overflow-hidden">
              <img 
                src={product.image} 
                className="img-zoom w-full h-80 object-cover" 
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold tracking-elegant mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {product.category}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-accent">
                  ${product.price}
                </span>
                <button className="btn-luxury bg-primary text-primary-foreground px-4 py-2 rounded-sm text-xs uppercase tracking-wide">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
</div>
```

### Luxury Feature Section

```jsx
<section className="bg-secondary py-20">
  <div className="container mx-auto px-6">
    <div className="grid grid-cols-3 gap-12">
      {features.map((feature, i) => (
        <div 
          key={i}
          className={`text-center animate-fade-up delay-${(i + 1) * 100}`}
        >
          {/* Icon with gold accent */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-accent text-2xl">{feature.icon}</span>
          </div>
          
          <h3 className="text-xl font-semibold tracking-elegant mb-3">
            {feature.title}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Newsletter Signup

```jsx
<section className="bg-primary text-primary-foreground py-16">
  <div className="container mx-auto px-6 text-center">
    <h2 className="text-4xl font-bold tracking-luxury uppercase mb-4 animate-fade-up">
      JOIN OUR EXCLUSIVE LIST
    </h2>
    <p className="text-lg text-muted-foreground mb-8 animate-fade-up delay-100">
      Be the first to know about new collections
    </p>
    
    <form className="max-w-md mx-auto flex gap-4 animate-fade-up delay-200">
      <input 
        type="email" 
        placeholder="Your email"
        className="flex-1 px-6 py-3 rounded-sm bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button 
        type="submit"
        className="btn-luxury gradient-gold text-white px-8 py-3 rounded-sm uppercase tracking-elegant font-bold"
      >
        Subscribe
      </button>
    </form>
  </div>
</section>
```

---

## 🎨 Quick Reference Cheat Sheet

| Component | Classes |
|-----------|---------|
| **Primary Button** | `btn-luxury bg-primary text-primary-foreground px-8 py-3` |
| **Gold Button** | `btn-luxury gradient-gold text-white px-8 py-3` |
| **Luxury Card** | `card-luxury bg-card border border-border rounded-sm p-6` |
| **Product Image** | `img-zoom w-full h-64 object-cover` |
| **Animated Link** | `link-underline text-foreground hover:text-accent` |
| **Headline** | `text-4xl font-bold tracking-luxury uppercase` |
| **Subheading** | `text-xl tracking-elegant` |
| **Fade In** | `animate-fade-up delay-200` |
| **Gold Text** | `text-accent` or `text-[hsl(var(--gold))]` |
| **Dark Section** | `bg-primary text-primary-foreground` |

---

## 💡 Pro Tips

1. **Always use uppercase for CTAs** - It adds luxury feel
2. **Combine tracking-luxury/elegant with uppercase** - Perfect for headlines
3. **Use animate-fade-up with staggered delays** - Creates sophisticated entrance
4. **Overflow-hidden is required** - For img-zoom to work properly
5. **Gold accents sparingly** - Too much gold looks gaudy
6. **White space is luxury** - Don't crowd elements
7. **Use img-zoom on product images** - Standard e-commerce practice
8. **Link underlines are subtle** - Elegant interaction feedback

---

## 🚀 Getting Started Checklist

- [ ] Import fonts: Cormorant Garamond & Inter
- [ ] Include the custom CSS file
- [ ] Use semantic HTML with proper class names
- [ ] Test hover states on all interactive elements
- [ ] Check dark mode if implementing
- [ ] Ensure images have proper aspect ratios
- [ ] Test animations on slower devices
- [ ] Verify color contrast for accessibility

---

Made with ✨ for luxury fashion e-commerce
