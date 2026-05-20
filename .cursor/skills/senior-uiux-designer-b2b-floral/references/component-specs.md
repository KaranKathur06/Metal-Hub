# Component Specifications — B2B Floral Marketplace

## Product Card

### Variants
- **Grid view**: 280px wide, image-dominant, minimal text
- **List view**: Full-width, data-dense, inline actions
- **Compact view**: 200px, quick-scan for power users

### Required Elements
- Product image (lazy-loaded, 2:3 aspect ratio)
- Variety name + color
- Price per stem/bunch (with unit indicator)
- Availability badge (In Stock / Low Stock / Pre-Order)
- Supplier name + rating
- Quick-add button with quantity stepper

### Optional Elements
- Grade indicator (A/B/C pill)
- Stem length
- Vase life estimate
- Farm origin flag
- Favorite/save icon
- Compare checkbox

### States
- Default, Hover (elevation + quick actions), Selected (checkbox), Out of Stock (grayed, "Notify Me")

---

## Availability Badge

### Status Types
| Status | Color | Label | Icon |
|--------|-------|-------|------|
| In Stock | `#2D5A3D` | "Available" | ✓ checkmark |
| Low Stock | `#D4A017` | "Only X left" | ⚠ warning |
| Pre-Order | `#5B7DB1` | "Ships [date]" | 📅 calendar |
| Out of Stock | `#9CA3AF` | "Sold Out" | ✗ cross |
| Seasonal | `#E8B4B8` | "Coming Soon" | 🌱 sprout |

### Behavior
- Tooltip on hover shows exact quantity and restock date (if known)
- Low Stock threshold configurable per product category

---

## Quantity Stepper

### Configuration
- Min value: MOQ (e.g., 10 stems)
- Max value: Available inventory
- Step increment: Bunch size (e.g., 10)
- Direct input allowed (validates on blur)

### States
- Default, Focused (ring), Error (red border + message), Disabled (at min/max)

### Error Messages
- "Minimum order: X stems"
- "Only X available"
- "Must order in multiples of X"

---

## Pricing Table

### Columns
1. Quantity tier (e.g., "1-99", "100-499", "500+")
2. Price per unit
3. Savings percentage vs. base price

### Features
- Highlight current tier based on cart quantity
- Expand/collapse for products with 5+ tiers
- Customer-specific pricing indicated with lock icon + "Your Price"

---

## Filter Panel

### Filter Types
- **Checkbox group**: Flower type, color, origin
- **Range slider**: Price, stem length
- **Date picker**: Availability date
- **Toggle**: Show in-stock only, certified farms only

### Behavior
- Filters apply immediately (no "Apply" button)
- Active filters shown as removable chips above results
- "Clear all" resets to defaults
- Filter counts show matching products per option

---

## Cart Summary

### Line Item Display
- Product thumbnail (48px)
- Variety + supplier
- Unit price × quantity = subtotal
- Delivery date selector (if split shipment)
- Remove / Edit quantity actions

### Summary Section
- Subtotal
- Freight estimate (with "Calculate" CTA if TBD)
- Taxes (if applicable)
- Applied credits/discounts
- Total due

### CTAs
- "Continue Shopping" (secondary)
- "Proceed to Checkout" (primary)
- "Save Cart" (tertiary, for returning later)

---

## Order Status Timeline

### Stages
1. **Order Placed** — timestamp, order ID
2. **Confirmed** — supplier acknowledged
3. **Preparing** — picking/packing in progress
4. **Shipped** — carrier + tracking number
5. **In Transit** — real-time location (if available)
6. **Delivered** — proof of delivery, signature

### Visual
- Horizontal stepper on desktop
- Vertical timeline on mobile
- Current stage highlighted, future stages dimmed
- Click stage to expand details

---

## Notification System

### Types
| Type | Icon | Color | Auto-dismiss |
|------|------|-------|--------------|
| Success | ✓ | Green | 5 seconds |
| Error | ✗ | Red | Manual |
| Warning | ⚠ | Yellow | 10 seconds |
| Info | ℹ | Blue | 8 seconds |

### Position
- Toast: Top-right corner, stacks vertically
- Inline: Below affected element

### Actions
- Dismiss (X button)
- Optional CTA ("View Order", "Retry")
