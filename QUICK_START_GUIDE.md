# Quick Start Guide - Video Management System

## 🎯 Quick Navigation

### For Admins:
```
/editor → Videos Tab → VideoManager Component
```

### For Students:
```
/video-library → VideoLibrary Component
```

---

## 📋 Step-by-Step: Adding Your First Video

### Step 1: Access Video Manager
1. Navigate to `/editor`
2. Click the **"Videos"** tab
3. You'll see the VideoManager interface

### Step 2: Create a Course
1. Click **"Add Course"** button (top-right)
2. Fill in:
   - Upload Thumbnail (optional)
   - Course Name (e.g., "Science Experiments")
   - Priority (0 for first, 1 for second, etc.)
3. Click **"Add Course"**

### Step 3: Add a Chapter
1. Click the course to expand it
2. Click **"Add Chapter"** button (in course header)
3. Fill in:
   - Upload Thumbnail (optional)
   - Chapter Name (e.g., "Experiment Explanations")
   - Priority (0, 1, 2...)
4. Click **"Add Chapter"**

### Step 4: Add a Video/Reel
1. Expand the chapter
2. Click **"Add Video"** button
3. Fill in:
   - Upload Cover Image (optional)
   - Video Title
   - YouTube URL (full link or short link)
   - **Video Type**: Choose 🎥 Video or 🎬 Reel
   - Priority
4. Click **"Add Video"**

### Step 5: Preview
1. Click the ▶️ play button on any video
2. Watch it in the modal player
3. Done! ✨

---

## 🎬 When to Use Video vs Reel?

### Use "Video" (🎥) for:
- Tutorial videos
- Lecture recordings
- Experiment demonstrations
- Full-length content (>1 minute)
- Horizontal/landscape videos

### Use "Reel" (🎬) for:
- YouTube Shorts
- Quick tips (30-60 seconds)
- Vertical/portrait videos
- Social media style content
- Teasers

---

## 🎨 UI Overview

### VideoManager (Admin View)

```
┌─────────────────────────────────────────────┐
│  📹 Video Library Manager    [Add Course]   │
├─────────────────────────────────────────────┤
│                                             │
│  ▼ 📚 Science Experiments    ✏️ 🗑️ [+Ch]   │
│     └─ ▼ 📖 Experiment Explanations  ✏️ 🗑️  │
│           ├─ 🎥 কপিকলের সাহায্যে... ▶️ ✏️ 🗑️  │
│           └─ 🎬 নিজে তোলো নিজেকে    ▶️ ✏️ 🗑️  │
│                                             │
└─────────────────────────────────────────────┘
```

### VideoLibrary (Student View)

```
┌─────────────────────────────────────────────┐
│  🎥 Video Library                           │
│  [📚 All] [🎥 Videos] [🎬 Reels]            │
├─────────────────────────────────────────────┤
│                                             │
│  ▼ Science Experiments                      │
│     📖 2 Chapters · 🎥 2 Items              │
│     └─ ▼ Experiment Explanations            │
│           ┌────────┐  ┌────────┐            │
│           │ [IMG]  │  │ [IMG]  │            │
│           │ 🎥     │  │ 🎬     │            │
│           │Title 1 │  │Title 2 │            │
│           └────────┘  └────────┘            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔑 Key Features at a Glance

| Feature | VideoManager (Admin) | VideoLibrary (Student) |
|---------|---------------------|------------------------|
| Add/Edit/Delete | ✅ Yes | ❌ No |
| Collapsible Sections | ✅ Yes | ✅ Yes |
| Filter by Type | ❌ No (shows all) | ✅ Yes |
| Inline Player | ✅ Yes | ✅ Yes |
| Priority Sorting | ✅ Auto | ✅ Auto |
| Grid Layout | ❌ List view | ✅ Card grid |
| Thumbnails | ✅ Yes | ✅ Yes |

---

## 💡 Pro Tips

### 1. **Organize with Priority**
   ```
   Priority 0 = First
   Priority 1 = Second
   Priority 2 = Third
   ```

### 2. **Use Descriptive Names**
   ```
   ✅ Good: "Chapter 1: Newton's Laws"
   ❌ Avoid: "Ch1" or "Video 1"
   ```

### 3. **Add Thumbnails**
   - Makes content more appealing
   - Helps students identify videos quickly
   - Use ImageUpload component

### 4. **Choose Right Type**
   - **Video**: Detailed explanations, lectures
   - **Reel**: Quick concepts, fun facts

### 5. **Test Before Publishing**
   - Click play button to preview
   - Check if YouTube link works
   - Verify type (Video/Reel) is correct

---

## 🔧 Troubleshooting

### "Invalid YouTube URL"
**Fix**: Make sure you're using a valid YouTube link:
```
✅ https://www.youtube.com/watch?v=VIDEO_ID
✅ https://youtu.be/VIDEO_ID
✅ https://www.youtube.com/shorts/VIDEO_ID
```

### Video won't play
**Possible reasons**:
1. YouTube link is broken
2. Video is private/unlisted
3. Network issue

**Fix**: Re-check the YouTube URL and privacy settings

### Can't see new video in library
**Fix**:
1. Make sure you saved it
2. Check if it's in the right chapter
3. Refresh the page
4. Check filter (All/Videos/Reels)

### Videos not in order
**Fix**: Check priority numbers (0, 1, 2...)

---

## 📱 Mobile Usage

### On Small Screens:
- Everything collapses by default
- Tap to expand courses/chapters
- Swipe horizontally for video cards
- Full-screen video player

### Recommended:
- Keep titles concise
- Use good quality thumbnails
- Test on mobile before publishing

---

## 🚦 Status Indicators

| Icon | Meaning |
|------|---------|
| ▶️ | Expand/Collapse |
| ✏️ | Edit |
| 🗑️ | Delete |
| ▶️ | Play Video |
| 🎥 | Regular Video |
| 🎬 | Reel/Short |
| 📚 | Course |
| 📖 | Chapter |

---

## ⚡ Keyboard Shortcuts

Currently not implemented, but good to add later:
- `Space` - Play/Pause
- `Esc` - Close modal
- `←/→` - Previous/Next video

---

## 🎓 Example Workflow

### Complete Example:

1. **Add Course**: "HSC Physics"
2. **Add Chapters**:
   - "Chapter 1: Motion" (priority: 0)
   - "Chapter 2: Force" (priority: 1)
3. **Add Videos to Chapter 1**:
   - "Speed and Velocity" - Type: Video (priority: 0)
   - "Quick Motion Tip" - Type: Reel (priority: 1)
4. **Result**:
   ```
   HSC Physics
   └─ Chapter 1: Motion
      ├─ 🎥 Speed and Velocity
      └─ 🎬 Quick Motion Tip
   └─ Chapter 2: Force
   ```

---

## 📊 Data Management

### What gets stored:
```javascript
Course {
  id: "unique-id",
  title: "Course Name",
  thumbnail: "url",
  priority: 0,
  chapters: [
    {
      id: "unique-id",
      title: "Chapter Name",
      thumbnail: "url",
      priority: 0,
      Videos: [
        {
          id: "unique-id",
          title: "Video Title",
          url: "youtube-url",
          thumbnail: "url",
          type: "video" | "reel",
          priority: 0
        }
      ]
    }
  ]
}
```

---

## ✅ Launch Checklist

Before going live:

- [ ] At least 1 course added
- [ ] At least 1 chapter per course
- [ ] At least 1 video per chapter
- [ ] All YouTube links tested
- [ ] Thumbnails uploaded (optional but recommended)
- [ ] Priorities set correctly
- [ ] Video types chosen correctly
- [ ] Tested on mobile
- [ ] Tested filtering (All/Videos/Reels)
- [ ] Tested video playback

---

## 🎉 You're Ready!

Your video management system is now set up and ready to use. Start adding content and enjoy the streamlined workflow!

**Need help?** Check the main documentation: `VIDEO_SYSTEM_DOCUMENTATION.md`
