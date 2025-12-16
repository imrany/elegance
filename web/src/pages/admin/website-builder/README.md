# Website Builder - Complete Setup Guide

## Overview

A comprehensive website builder system that allows admins to customize their e-commerce website without coding. Features include hero section, about section, features, contact information, theme customization, SEO settings, and social media links.

## Features

### 1. **Hero Section**

- Custom title and subtitle
- Call-to-action button with link
- Background image upload
- Overlay with adjustable opacity
- Live preview

### 2. **About Section**

- Section title and description
- Image upload
- Key features list (dynamic)
- Visual preview

### 3. **Features Section**

- Section title and subtitle
- Multiple feature cards with:
  - Selectable icons
  - Title
  - Description
- Add/Edit/Delete features

### 4. **Contact Section**

- Contact information (email, phone, address)
- Google Maps integration
- Toggle map visibility
- Contact form placeholder

### 5. **Theme Customization**

- Primary, secondary, and accent colors
- Font family selection
- Border radius options
- Live color preview

### 6. **SEO Settings**

- Page title (with character counter)
- Meta description (with character counter)
- Keywords
- Open Graph image upload
- Favicon upload

### 7. **Social Media Links**

- Facebook, Twitter, Instagram
- LinkedIn, YouTube, TikTok
- Display in footer

## File Structure

```
/src
  /pages
    /admin
      WebsiteBuilderPage.tsx         # Main builder page
  /components
    /website-builder
      HeroSection.tsx                 # Hero section editor
      AboutSection.tsx                # About section editor
      FeaturesSection.tsx             # Features editor
      ContactSection.tsx              # Contact editor
      ThemeCustomizer.tsx             # Theme settings
      SEOSettings.tsx                 # SEO configuration
      SocialMediaLinks.tsx            # Social links editor
  /lib
    api.ts                            # API methods (updated)
/backend
  /routes
    website-builder.js                # Backend API routes
  /data
    website-config.json               # Configuration storage
  /uploads                            # Uploaded images
```

## Installation Steps

### 1. Frontend Setup

#### Install Required Dependencies

```bash
npm install @tanstack/react-query lucide-react
```

#### Add Components

Create the following files in your project:

1. `src/pages/admin/WebsiteBuilderPage.tsx` - Main builder page
2. `src/components/website-builder/HeroSection.tsx`
3. `src/components/website-builder/AboutSection.tsx`
4. `src/components/website-builder/FeaturesSection.tsx`
5. `src/components/website-builder/ContactSection.tsx`
6. `src/components/website-builder/ThemeCustomizer.tsx`
7. `src/components/website-builder/SEOSettings.tsx`
8. `src/components/website-builder/SocialMediaLinks.tsx`

#### Update API File

Add the website builder API methods to your `api.ts` file:

```typescript
getWebsiteConfig();
updateWebsiteConfig(config);
uploadImage(formData);
deleteImage(filename);
```

#### Add Route

Add to your admin router:

```typescript
import WebsiteBuilderPage from '@/pages/admin/WebsiteBuilderPage';

// In your routes
<Route path="/admin/website-builder" element={<WebsiteBuilderPage />} />
```

### 2. Backend Setup

#### Install Dependencies

```bash
npm install express multer
```

#### Create API Routes

1. Create `backend/routes/website-builder.js`
2. Add the provided backend code
3. Create directories: `backend/data`, `backend/uploads`

#### Register Routes

In your main Express app:

```javascript
const websiteBuilder = require("./routes/website-builder");
app.use(websiteBuilder);
```

#### Database Setup (Optional)

If using a database instead of JSON file storage:

```sql
CREATE TABLE website_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO website_settings (config) VALUES ('{}');
```

### 3. Frontend Display Setup

Create `src/pages/HomePage.tsx` with the provided display component to show the configured website.

## Usage

### Admin Panel

1. Navigate to `/admin/website-builder`
2. Use tabs to switch between sections:
   - **Hero**: Configure hero section
   - **About**: Set up about section
   - **Features**: Add/edit feature cards
   - **Contact**: Set contact information
   - **Theme**: Customize colors and fonts
   - **SEO**: Configure SEO settings
   - **Social**: Add social media links
3. Click "Save Changes" to persist configuration
4. Click "Preview" to see changes on the live site

### Configuration Storage

#### Option 1: JSON File (Default)

- Configuration saved in `backend/data/website-config.json`
- No database required
- Easy to backup and version control

#### Option 2: Database

- Configuration stored in `website_settings` table
- Better for multi-tenant systems
- Easier to query and manipulate

## API Endpoints

### GET `/api/website-config`

Retrieve current website configuration

```json
{
  "success": true,
  "data": {
    /* configuration object */
  }
}
```

### PUT `/api/website-config`

Update website configuration

```json
{
  "hero": {
    /* hero config */
  },
  "about": {
    /* about config */
  }
  // ... other sections
}
```

### POST `/api/upload`

Upload image file

```
Content-Type: multipart/form-data
Body: file (image)
```

Response:

```json
{
  "success": true,
  "data": { "url": "/uploads/filename.jpg" }
}
```

### DELETE `/api/upload/:filename`

Delete uploaded image

## Customization

### Adding New Sections

1. Create new section component in `website-builder/`
2. Add section type to `WebsiteConfig` interface
3. Add tab in `WebsiteBuilderPage.tsx`
4. Add display logic in `HomePage.tsx`

### Adding More Icons

Edit `FeaturesSection.tsx`:

```typescript
const AVAILABLE_ICONS = [
  { name: "NewIcon", label: "New Icon", icon: NewIconComponent },
  // ... existing icons
];
```

### Custom Theme Properties

Add to theme configuration:

```typescript
theme: {
  // ... existing properties
  fontSize: string;
  lineHeight: string;
}
```

## Best Practices

1. **Image Optimization**
   - Compress images before upload
   - Use appropriate dimensions
   - Recommended sizes:
     - Hero background: 1920x1080px
     - About image: 800x600px
     - OG image: 1200x630px
     - Favicon: 32x32px or 64x64px

2. **SEO**
   - Keep titles under 60 characters
   - Keep descriptions under 160 characters
   - Use relevant keywords
   - Always set OG image for social sharing

3. **Performance**
   - Lazy load images
   - Optimize image sizes
   - Cache configuration
   - Use CDN for images in production

4. **Accessibility**
   - Ensure color contrast ratios
   - Add alt text to images
   - Use semantic HTML
   - Test with screen readers

## Troubleshooting

### Images not uploading

- Check file size (max 5MB)
- Verify upload directory permissions
- Check file type restrictions
- Ensure multer is configured correctly

### Configuration not saving

- Verify backend API is running
- Check network requests in browser DevTools
- Verify file write permissions
- Check for JSON syntax errors

### Theme not applying

- Clear browser cache
- Check CSS variable names
- Verify theme values are valid CSS
- Inspect element to see computed styles

## Security Considerations

1. **File Uploads**
   - Validate file types
   - Limit file sizes
   - Sanitize filenames
   - Store outside public directory if possible

2. **Configuration**
   - Validate all inputs
   - Sanitize HTML content
   - Protect API endpoints with authentication
   - Implement rate limiting

3. **Access Control**
   - Require admin authentication
   - Log all configuration changes
   - Implement role-based access
   - Regular security audits

## Future Enhancements

- [ ] Drag-and-drop section reordering
- [ ] A/B testing capabilities
- [ ] Version history and rollback
- [ ] Multi-language support
- [ ] Custom CSS editor
- [ ] Page templates
- [ ] Analytics integration
- [ ] Mobile preview mode
- [ ] Scheduled publishing
- [ ] Collaboration features

## Support

For issues or questions:

1. Check this documentation
2. Review example code
3. Check browser console for errors
4. Verify API responses
5. Review backend logs

## License

This website builder is part of your e-commerce system.
