import { linesForSubcategory, PRODUCT_CATEGORY_TREE, subcategoriesForMain } from '../data/productCategories.js';

const selectClass =
  'mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25';

/**
 * @param {{
 *   mainId: string;
 *   subId: string;
 *   line: string;
 *   onMainChange: (id: string) => void;
 *   onSubChange: (id: string) => void;
 *   onLineChange: (line: string) => void;
 *   required?: boolean;
 * }} props
 */
export function CategorySelectGroup({
  mainId,
  subId,
  line,
  onMainChange,
  onSubChange,
  onLineChange,
  required = true,
}) {
  const subs = subcategoriesForMain(mainId);
  const lines = linesForSubcategory(mainId, subId);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <label className="text-sm font-medium text-text-primary">Categoría</label>
        <select
          className={selectClass}
          value={mainId}
          onChange={(e) => onMainChange(e.target.value)}
          required={required}
        >
          <option value="">Selecciona…</option>
          {PRODUCT_CATEGORY_TREE.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-text-primary">Subcategoría</label>
        <select
          className={selectClass}
          value={subId}
          onChange={(e) => onSubChange(e.target.value)}
          required={required && Boolean(mainId)}
          disabled={!mainId}
        >
          <option value="">Selecciona…</option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-text-primary">Tipo / línea</label>
        <select
          className={selectClass}
          value={line}
          onChange={(e) => onLineChange(e.target.value)}
          required={required && Boolean(subId)}
          disabled={!subId}
        >
          <option value="">Selecciona…</option>
          {lines.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
