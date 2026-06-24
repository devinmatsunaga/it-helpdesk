export function Field({ label, children, required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export function TextInput(props) {
  return <input {...props} className={inputClasses} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${inputClasses} min-h-[120px] resize-y`} />;
}

export function Select(props) {
  return <select {...props} className={inputClasses} />;
}