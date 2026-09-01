// export function formatDate(dateStr: string) {
//   return new Date(dateStr).toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

export function formatDate( date: Date | string, format: string = "YYYY-MM-DD"): string {
  const d = new Date(date);

  const values: Record<string, string | number> = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, "0"),
    DD: String(d.getDate()).padStart(2, "0"),
    HH: String(d.getHours()).padStart(2, "0"),
    mm: String(d.getMinutes()).padStart(2, "0"),
    ss: String(d.getSeconds()).padStart(2, "0"),
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g,(key) => String(values[key])
  );
}