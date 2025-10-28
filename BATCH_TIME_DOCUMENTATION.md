# BatchTime Component - Documentation

## 🎯 Overview
The **BatchTime** component manages batch schedules for SSC and HSC classes across Saturday and Sunday. It provides a structured way to organize class timings with priority-based ordering.

---

## 📊 Data Structure

```javascript
{
  _id: "mongodb_id",
  SSC: {
    saturday: [
      { id: "uuid", time: "9:00 AM - 10:30 AM", priority: 1 },
      { id: "uuid", time: "11:00 AM - 12:30 PM", priority: 2 }
    ],
    sunday: [
      { id: "uuid", time: "9:00 AM - 10:30 AM", priority: 1 }
    ]
  },
  HSC: {
    saturday: [
      { id: "uuid", time: "2:00 PM - 3:30 PM", priority: 1 }
    ],
    sunday: [
      { id: "uuid", time: "10:00 AM - 11:30 AM", priority: 1 },
      { id: "uuid", time: "2:00 PM - 3:30 PM", priority: 2 }
    ]
  }
}
```

---

## ✨ Features

### **1. Two-Category System**
- **SSC Batches** - Blue theme
- **HSC Batches** - Green theme
- Each category has Saturday and Sunday schedules

### **2. Batch Management**
✅ **Add Batch** - Click "+ Add Batch" for any day
✅ **Edit Batch** - Modify existing batch time and priority
✅ **Delete Batch** - Remove batches with confirmation
✅ **Auto-Sort** - Batches automatically sort by priority

### **3. Modal-Based Forms**
- Clean modal interface for add/edit
- Real-time validation
- Cancel without saving
- Loading states during submission

### **4. Priority System**
- Lower priority numbers appear first
- Auto-sorts after add/edit
- Visual priority display on each batch

### **5. Mobile Responsive**
- Two-column layout on desktop
- Single column on mobile
- Touch-friendly buttons
- Responsive text sizes

---

## 🎨 Design

### **Color Schemes**

#### SSC (Blue Theme)
- Background: `from-blue-50 to-cyan-50`
- Border: `border-blue-300`
- Buttons: `bg-blue-600`
- Text: `text-blue-700`

#### HSC (Green Theme)
- Background: `from-green-50 to-emerald-50`
- Border: `border-green-300`
- Buttons: `bg-green-600`
- Text: `text-green-700`

### **Icons**
- 📅 MdSchedule - Main header
- 🕐 FaClock - Category headers
- ➕ FaPlus - Add batch button
- ✏️ FaEdit - Edit button
- 🗑️ FaTrash - Delete button

---

## 🔌 API Endpoints

### **GET /getbatchtime**
Fetches the batch time document (only one exists)

**Response:**
```json
{
  "_id": "...",
  "SSC": { "saturday": [...], "sunday": [...] },
  "HSC": { "saturday": [...], "sunday": [...] }
}
```

### **POST /insertbatchtime**
Creates new batch time document (first-time only)

**Request Body:**
```json
{
  "SSC": {
    "saturday": [],
    "sunday": []
  },
  "HSC": {
    "saturday": [],
    "sunday": []
  }
}
```

### **PUT /updatebatchtime/:id**
Updates existing batch time document

**Request Body:** Same as insert

---

## 🚀 How to Use

### **Initial Setup**
1. Navigate to **Editor Dashboard → Batch Time** tab
2. Component auto-initializes with empty structure if no data exists

### **Add a Batch**
1. Choose category (SSC or HSC)
2. Choose day (Saturday or Sunday)
3. Click "Add Batch" button
4. Fill in:
   - **Time**: e.g., "9:00 AM - 10:30 AM"
   - **Priority**: Number (1, 2, 3...)
5. Click "Add Batch" to save

### **Edit a Batch**
1. Click the blue edit icon (✏️) on any batch
2. Modal opens with current values
3. Modify time and/or priority
4. Click "Update Batch"
5. List auto-sorts by new priority

### **Delete a Batch**
1. Click the red delete icon (🗑️) on any batch
2. Confirm deletion in popup
3. Batch is removed immediately

---

## 📱 Layout Structure

### **Desktop View (lg: 1024px+)**
```
┌─────────────────────────────────────────────┐
│         Batch Time Management               │
├──────────────────┬──────────────────────────┤
│   SSC Batches    │    HSC Batches          │
│   (Blue)         │    (Green)              │
│                  │                          │
│   Saturday       │    Saturday             │
│   - Batch 1      │    - Batch 1            │
│   - Batch 2      │    - Batch 2            │
│                  │                          │
│   Sunday         │    Sunday               │
│   - Batch 1      │    - Batch 1            │
└──────────────────┴──────────────────────────┘
```

### **Mobile View (< 1024px)**
```
┌─────────────────────┐
│  SSC Batches        │
│  (Blue)             │
│                     │
│  Saturday           │
│  - Batch 1          │
│                     │
│  Sunday             │
│  - Batch 1          │
└─────────────────────┘
┌─────────────────────┐
│  HSC Batches        │
│  (Green)            │
│                     │
│  Saturday           │
│  - Batch 1          │
│                     │
│  Sunday             │
│  - Batch 1          │
└─────────────────────┘
```

---

## 💡 Use Cases

### **Example 1: Regular Schedule**
```javascript
SSC: {
  saturday: [
    { time: "9:00 AM - 10:30 AM", priority: 1 },
    { time: "11:00 AM - 12:30 PM", priority: 2 },
    { time: "2:00 PM - 3:30 PM", priority: 3 }
  ],
  sunday: [
    { time: "9:00 AM - 10:30 AM", priority: 1 },
    { time: "11:00 AM - 12:30 PM", priority: 2 }
  ]
}
```

### **Example 2: Named Batches**
```javascript
HSC: {
  saturday: [
    { time: "Morning Batch (9-11 AM)", priority: 1 },
    { time: "Afternoon Batch (2-4 PM)", priority: 2 }
  ],
  sunday: [
    { time: "Special Session (10-12)", priority: 1 }
  ]
}
```

---

## 🔍 Technical Details

### **State Management**
```javascript
const [batchTime, setBatchTime] = useState(null)        // Main data
const [loading, setLoading] = useState(true)            // Initial load
const [submitting, setSubmitting] = useState(false)     // Save state
const [isAddModalOpen, setIsAddModalOpen] = useState(false) // Modal state
const [modalConfig, setModalConfig] = useState({
  category: '',    // 'SSC' or 'HSC'
  day: '',         // 'saturday' or 'sunday'
  mode: 'add',     // 'add' or 'edit'
  editIndex: null  // Index for editing
})
```

### **Auto-Sort Logic**
```javascript
updatedBatchTime[category][day] = [...batches, newBatch]
  .sort((a, b) => a.priority - b.priority);
```

### **UUID Generation**
```javascript
const newBatch = {
  time: batchFormData.time.trim(),
  priority: parseInt(batchFormData.priority),
  id: crypto.randomUUID()  // Unique identifier
};
```

---

## ✅ Validation

### **Required Fields**
- ✅ Time (string, cannot be empty)
- ✅ Priority (number, minimum 1)

### **Auto-Trimming**
- Time input is automatically trimmed of whitespace

### **Number Validation**
- Priority must be a positive integer
- Mouse wheel disabled on number input

---

## 🎯 Best Practices

### **Time Format Examples**
✅ Good formats:
- "9:00 AM - 10:30 AM"
- "Morning Batch (9-11)"
- "2:00 PM - 3:30 PM"
- "Weekend Special 10-12"

❌ Avoid:
- Empty strings
- Just numbers without context
- Ambiguous times

### **Priority Management**
- Start with 1, 2, 3, 4...
- Leave gaps (10, 20, 30...) for future insertions
- Re-prioritize when needed (list auto-sorts)

### **Category Usage**
- **SSC**: Secondary School Certificate students
- **HSC**: Higher Secondary Certificate students
- Keep schedules separate for clarity

---

## 🐛 Troubleshooting

### **Batches not sorting?**
- Check priority numbers are different
- Reload page to re-fetch data
- Verify priority is a number, not string

### **Can't add batch?**
- Ensure both time and priority are filled
- Check network connection
- Verify backend is running

### **Changes not saving?**
- Check browser console for errors
- Verify API endpoint is correct
- Check MongoDB connection

### **Modal not closing?**
- Click Cancel button
- Click outside modal (backdrop)
- Check for JavaScript errors

---

## 🔮 Future Enhancements

1. **Batch Details**
   - Add teacher name
   - Add room/location
   - Add student capacity

2. **Bulk Operations**
   - Copy Saturday schedule to Sunday
   - Duplicate SSC to HSC
   - Import/Export schedules

3. **Visual Calendar**
   - Weekly calendar view
   - Color-coded batches
   - Drag-and-drop reordering

4. **Notifications**
   - Remind before batch time
   - Schedule change alerts
   - SMS/Email integration

5. **Analytics**
   - Popular time slots
   - Batch occupancy
   - Attendance correlation

---

## 📝 Usage in Client Site

To display batch times on your public website:

```javascript
// Fetch batch time
const response = await fetch('https://spoffice-server.vercel.app/getbatchtime');
const batchData = await response.json();

// Display SSC Saturday batches
{batchData.SSC.saturday.map(batch => (
  <div key={batch.id}>
    <p>{batch.time}</p>
  </div>
))}

// Display HSC Sunday batches
{batchData.HSC.sunday.map(batch => (
  <div key={batch.id}>
    <p>{batch.time}</p>
  </div>
))}
```

---

## 🎓 Component Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Add Batch | ✅ | Add new batch to any category/day |
| Edit Batch | ✅ | Modify existing batch details |
| Delete Batch | ✅ | Remove batch with confirmation |
| Auto-Sort | ✅ | Automatic priority-based sorting |
| Modal Forms | ✅ | Clean add/edit interface |
| Validation | ✅ | Required field checking |
| Responsive | ✅ | Mobile and desktop optimized |
| Color Themes | ✅ | SSC (Blue) and HSC (Green) |
| Loading States | ✅ | Visual feedback during operations |
| Error Handling | ✅ | Graceful error management |

---

## 📐 Responsive Breakpoints

```css
/* Mobile (default) */
- Single column layout
- Stacked sections
- btn-xs buttons

/* Small (sm: 640px+) */
- btn-sm buttons
- Better spacing

/* Large (lg: 1024px+) */
- Two-column grid (SSC | HSC)
- Side-by-side categories
- More padding
```

---

**Created**: October 29, 2025  
**Component**: BatchTime.jsx  
**Location**: Editor Dashboard → Batch Time Tab  
**Status**: Production Ready ✅
