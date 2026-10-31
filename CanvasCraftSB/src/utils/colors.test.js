import assert from "node:assert/strict";
import test from "node:test";
import { getContrastRatio, normalizeHex, resolveColor } from "./colors.js";
import { CANVAS_BACKGROUND, COLOR_PALETTE } from "./constants.js";

test("every palette color is readable on its own theme background", () => {
  for (const entry of COLOR_PALETTE) {
    assert.ok(
      getContrastRatio(entry.light, CANVAS_BACKGROUND.light) >= 3,
      `${entry.light} on light canvas`,
    );
    assert.ok(
      getContrastRatio(entry.dark, CANVAS_BACKGROUND.dark) >= 3,
      `${entry.dark} on dark canvas`,
    );
  }
});

test("palette colors resolve to different values in light and dark mode", () => {
  assert.equal(resolveColor("#000000", "light"), "#000000");
  assert.equal(resolveColor("#000000", "dark"), "#f8fafc");
  assert.equal(resolveColor("#EF4444", "dark"), "#f87171");
});

test("legacy green resolves like the current palette green", () => {
  assert.equal(resolveColor("#10b981", "dark"), "#34d399");
  assert.equal(resolveColor("#10b981", "light"), "#059669");
});

test("custom colors are lightened in dark mode and darkened in light mode", () => {
  const darkResult = resolveColor("#1e3a8a", "dark");
  assert.notEqual(darkResult, "#1e3a8a");
  assert.ok(getContrastRatio(darkResult, CANVAS_BACKGROUND.dark) >= 3);

  const lightResult = resolveColor("#fde68a", "light");
  assert.notEqual(lightResult, "#fde68a");
  assert.ok(getContrastRatio(lightResult, CANVAS_BACKGROUND.light) >= 3);
});

test("readable custom colors are left unchanged", () => {
  assert.equal(resolveColor("#0ea5e9", "dark"), "#0ea5e9");
  assert.equal(resolveColor("#7c2d12", "light"), "#7c2d12");
});

test("text uses a stricter contrast threshold", () => {
  const result = resolveColor("#0ea5e9", "light", 4.5);
  assert.ok(getContrastRatio(result, CANVAS_BACKGROUND.light) >= 4.5);
});

test("invalid colors are returned unchanged", () => {
  assert.equal(resolveColor("red", "dark"), "red");
  assert.equal(normalizeHex("#FFF"), "#ffffff");
  assert.equal(normalizeHex("nope"), null);
});

test("contrast ratio rejects invalid input", () => {
  assert.throws(() => getContrastRatio("red", "#ffffff"), TypeError);
});
