---
name: frontend-design
description: How to compose OneUp AI's UI well — spacing rhythm, surface and elevation strategy, visual hierarchy, designed states (loading/empty/error), and microcopy. Read this when building or laying out any screen, not just wiring components.
when_to_use: Use when building a page, feature, or any screen layout — deciding spacing, what goes in a Card, button hierarchy, how a section reads. Use when designing empty, loading, or error states. Use when writing button labels, error messages, or any UI copy. Triggers on "design", "layout", "looks", "polish", "spacing", "empty state", "make it look good".
paths: frontend/**
---

# Frontend Design

This is an established product with a set MUI theme, not a greenfield brand. The goal is a screen that reads as deliberate and consistent with the rest of the app — composed from the existing primitives, not invented. Token values live in `frontend-theme`; this skill is about how to combine them.

## The system at a glance
The theme is **flat and bordered**: cards have a 1px divider border and no drop shadow, ripple is disabled, and separation comes from borders, background shifts, and whitespace — not elevation. Build with that grain, not against it.

## Spacing is a scale, not a guess
MUI's spacing unit is 8px. Pick from a small set so the whole app shares one rhythm — don't reach for `mb: 3.5` or `p: 2.25`.

| Relationship | `sx` value | px |
|--------------|-----------|-----|
| Tight / related (icon + label, label + its control) | `1` | 8 |
| Within a group (stacked fields, list rows) | `2` | 16 |
| Between groups in a section | `3` | 24 |
| Between major sections of a page | `4`–`5` | 32–40 |

Closeness signals relatedness. Two things 8px apart read as one unit; 32px apart read as separate. Use distance to group, before reaching for a border or a Card.

Page margins are already set by `NewBaseLayout` — don't re-add them. Card padding is already set by the theme — don't re-add it.

## Surfaces: when to contain, when to leave flat
- The page sits on `background.default`. Section content can live directly on it — it does **not** all need to be in a card.
- Group genuinely related content in **one** `Card` (`background.paper` + the theme border). A KPI, a form, a table each earn a surface.
- **Never nest cards.** One level of containment. A card inside a card inside a grid reads as noise and flattens hierarchy.
- Don't add `elevation` or shadows to cards — the border carries the separation. `shadows[1]` is only for things that genuinely float (menus, popovers), and those are already themed.
- If a border isn't doing work, use whitespace instead. A page of bordered boxes is busier than a page that uses spacing to separate.

## Hierarchy: one focus per view
- **One primary action** per screen — `variant="contained"`. Everything else is `outlined` or `text`. Two contained buttons side by side cancel each other out and the user doesn't know where to look.
- Build hierarchy with type + weight + color + space, not by adding borders and colors everywhere:
  - Page title → `h4`
  - Section heading → `h6` or `subtitle2`
  - Supporting / secondary copy → `body2` in `text.secondary`
- `text.secondary` is the cheapest way to add depth — demote labels, hints, and metadata to it so the primary content stands out without extra color.

## Rhythm down the page
Peer sections get the **same** spacing between them. Inconsistent gaps (24px here, 36px there) are what make a layout feel unconsidered even when every component is correct. Set the rhythm once and hold it.

## Designed states — every data view has four
A screen that fetches data is not done until all four are handled. Don't ship only the populated state.

1. **Loading** → `<Loading message="Loading members..." />`, with context. For lists, a skeleton reads better than a blank spinner.
2. **Empty (no data yet)** → an icon, one plain sentence, and the **primary action to create the first item**. This is an invitation, not a dead end. (See `frontend-crud` for the table version.)
3. **Empty (0 search/filter results)** → keep the toolbar and table chrome, say "No matches," let them clear the filter. This is **different** from "no data yet" — don't show the create-first-item screen here.
4. **Error** → `<ErrorMessage />` saying what failed and offering a retry. Never a raw error string.

## Microcopy is design material
Words exist to help someone use the screen. Write them with the same care as spacing.

- **Buttons name the outcome**, not the mechanic: "Create department", "Save changes", "Delete member" — never "Submit" or "OK". An action keeps its name through the whole flow: a button that says "Publish" produces a toast that says "Published."
- **Label what the user controls**, in their words — "Members", not "User entities".
- **Errors are specific and actionable**, in the product's voice: what happened and what to do. They don't apologize and they're never vague. "Couldn't save — name is already taken" beats "An error occurred."
- **Empty states invite the next action**, they don't just state absence.
- Sentence case, plain verbs, no filler.

## Composed vs templated — the difference
```
✗ Templated dump                          ✓ Composed
─────────────────────────                 ─────────────────────────
every block wrapped in a Card             content grouped only where a surface earns it
nested cards in the grid                  one level of containment, whitespace elsewhere
three contained buttons                   one contained primary, rest text/outlined
h4 on every heading                       h4 title, h6 sections, body2 secondary
mb: 2, mb: 3, mb: 4 scattered             one consistent section rhythm
only the populated state built            loading, empty, error, populated all designed
"Submit" / "An error occurred"            "Create project" / "Name already taken"
```

## Before calling a screen done
- [ ] One primary action; supporting actions are quieter
- [ ] Spacing comes from the scale; rhythm between sections is consistent
- [ ] Containment is purposeful — no nested cards, no card-wrapping everything
- [ ] Loading, empty, error, and populated states all exist
- [ ] Buttons and errors name outcomes in plain language
- [ ] Colors and surfaces are theme tokens (see `frontend-theme`)
