# PromoVideo Component - Documentation

## 🎯 Overview
The **PromoVideo** component manages a single promotional video for your website, similar to the NoticeBoard component. It allows you to create, update, and preview a YouTube promotional video that can be displayed on your site.

---

## ✨ Features

### **1. Single Video Management**
- Create one promo video (first-time only)
- Update existing promo video anytime
- Toggle active/inactive status
- Preview video before saving

### **2. YouTube Integration**
- Supports multiple YouTube URL formats:
  - Full URL: `https://www.youtube.com/watch?v=VIDEO_ID`
  - Short URL: `https://youtu.be/VIDEO_ID`
  - Embed URL: `https://www.youtube.com/embed/VIDEO_ID`
  - Direct Video ID: `VIDEO_ID` (11 characters)
- Auto-extracts video ID for embedding
- Shows video thumbnail from YouTube
- Validates URL format in real-time

### **3. Video Preview**
- Click "Preview" button to watch video
- Modal player with full controls
- Fullscreen support
- Auto-embeds with YouTube player

### **4. Form Validation**
- Required fields: Title, YouTube URL
- Real-time URL validation
- Visual feedback (✓ valid / ✗ invalid)
- Prevents submission with invalid URL

### **5. Mobile Responsive**
- Optimized layouts for all screen sizes
- Touch-friendly buttons
- Stacked layouts on small screens
- Aspect ratio maintained for video

---

## 🎨 Design

### **Color Scheme**
- Primary: Red (YouTube theme)
- Secondary: Orange
- Accent: Green (for preview/active status)
- Gradients: `from-red-50 to-orange-50`

### **Icons**
- 🎬 FaYoutube - Header icon
- ▶️ FaPlay - Play/Preview button
- ✖️ IoMdClose - Close modal

---

## 📊 Data Structure

```javascript
{
  _id: "mongodb_id",
  title: "String - Video title",
  url: "String - YouTube URL or video ID",
  description: "String - Optional description",
  isActive: "Boolean - Visibility status"
}
```

---

## 🔌 API Endpoints

### **GET /getpromovideo**
Fetches the promo video document (only one exists)

### **POST /insertpromovideo**
Creates new promo video (first-time only)

**Request Body:**
```json
{
  "title": "Welcome to Sohag Physics",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "description": "Check out our courses!",
  "isActive": true
}
```

### **PUT /updatepromovideo/:id**
Updates existing promo video

**Request Body:** Same as insert

---

## 🚀 How to Use

### **First Time Setup**
1. Navigate to **Editor Dashboard → Promo Video** tab
2. Click "Create Promo Video" button
3. Fill in:
   - **Title** (required): e.g., "Welcome Video"
   - **YouTube URL** (required): Paste any YouTube URL format
   - **Description** (optional): Additional details
   - **Active** checkbox: Check to make visible
4. Preview thumbnail appears if URL is valid
5. Click "Create Video"

### **Update Existing Video**
1. Click "Update Video" button
2. Modify any fields
3. Real-time validation shows URL status
4. Click "Update Video" to save

### **Preview Video**
1. Click green "Preview" button
2. Modal opens with embedded video
3. Play, pause, fullscreen as needed
4. Click X or backdrop to close

---

## 🛠️ Technical Details

### **URL Extraction Logic**
```javascript
const extractYoutubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (let pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};
```

### **Embed URL Generation**
```javascript
const getEmbedUrl = (url) => {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
};
```

### **Thumbnail URL**
```javascript
// High quality
`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

// Fallback
`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile (default) */
- Stacked buttons (flex-col)
- Full width buttons
- Smaller text (text-xl)
- Compact padding (p-4)

/* Small screens (sm: 640px+) */
- Horizontal buttons (flex-row)
- Auto-width buttons
- Larger text (text-2xl)
- More padding (p-6)
```

---

## ✅ Features Checklist

- [x] Create promo video
- [x] Update promo video
- [x] Delete promo video (via update to empty)
- [x] Preview video in modal
- [x] YouTube URL validation
- [x] Multiple URL format support
- [x] Thumbnail preview
- [x] Active/Inactive toggle
- [x] Optional description field
- [x] Mobile responsive design
- [x] Loading states
- [x] Error handling
- [x] Success notifications
- [x] Form reset on cancel

---

## 🎯 Usage in Client Site

To display the promo video on your public website:

```javascript
// Fetch promo video
const response = await fetch('https://spoffice-server.vercel.app/getpromovideo');
const promoVideo = await response.json();

// Check if active
if (promoVideo && promoVideo.isActive) {
  const videoId = extractYoutubeId(promoVideo.url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  // Display iframe
  <iframe
    src={embedUrl}
    title={promoVideo.title}
    className="w-full aspect-video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
}
```

---

## 🔍 Validation Examples

### ✅ Valid URLs
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
dQw4w9WgXcQ
```

### ❌ Invalid URLs
```
https://vimeo.com/123456
not-a-video-id
https://youtube.com/channel/123
```

---

## 🐛 Troubleshooting

### **Video not showing in preview?**
- Check if URL is valid YouTube link
- Ensure video is not private/age-restricted
- Try different URL format

### **Thumbnail not loading?**
- Some videos don't have maxresdefault, fallback to hqdefault works
- Check if video ID is correct

### **Changes not saving?**
- Check network tab for API errors
- Verify backend is running
- Check MongoDB connection

### **Modal not closing?**
- Click X button, backdrop, or ESC key
- Check browser console for errors

---

## 🎓 Best Practices

1. **Choose Good Promo Videos**
   - Keep it short (30-90 seconds)
   - Clear audio and video quality
   - Engaging opening (first 3 seconds)
   - Call to action at end

2. **Video Settings on YouTube**
   - Set as Public or Unlisted
   - Enable embedding
   - Add good title and description
   - Use custom thumbnail

3. **Testing**
   - Test on multiple devices
   - Check in different browsers
   - Verify fullscreen works
   - Test with different video lengths

4. **Performance**
   - YouTube handles hosting
   - No storage on your server
   - Fast loading via CDN
   - Auto quality adjustment

---

## 🔮 Future Enhancements

1. **Multiple Promo Videos**
   - Carousel of promo videos
   - Category-based promos
   - Scheduled rotation

2. **Analytics**
   - View count tracking
   - Watch time statistics
   - Click-through rate

3. **Advanced Features**
   - Auto-play on page load
   - Custom thumbnail upload
   - Video chapters support
   - Subtitle support

4. **Platform Support**
   - Vimeo integration
   - Direct video upload
   - Multiple video platforms

---

## 📝 Notes

- Only **one promo video** exists in database at a time
- Similar pattern to NoticeBoard component
- Uses same validation and error handling
- Red/Orange theme matches YouTube branding
- Modal uses DaisyUI components
- Fully responsive and accessible

---

**Created**: October 28, 2025  
**Component**: PromoVideo.jsx  
**Location**: Editor Dashboard → Promo Video Tab  
**Status**: Production Ready ✅
