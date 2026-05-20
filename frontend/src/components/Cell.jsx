export default function Cell({ value, onClick, disabled }) {
  const cls = ['cell'];
  if (disabled) cls.push('disabled');

  return (
    <div onClick={disabled ? undefined : onClick} className={cls.join(' ')}>
      {value ? (
        <span className={value === 'X' ? 'x' : 'o'}>{value}</span>
      ) : null}
    </div>
  );
}
