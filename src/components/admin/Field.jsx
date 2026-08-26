
export const Field = ({ label, value, onChange, required, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm"
    />
  </div>
);

export default Field;
