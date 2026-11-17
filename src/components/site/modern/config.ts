import { branches } from "../../../site-data";

// إعدادات قسم MODERN SURFACE.
// WHATSAPP_NUMBER: رقم واحد للشركة تصل إليه طلبات عرض السعر. الشركة ما حدّدت رقماً واحداً للطلبات،
// فتُرك فاضياً، ويختار الزبون الفرع والموظف من الأرقام المؤكدة أدناه. لو حدّدت الشركة رقماً اكتبه هنا.
export const WHATSAPP_NUMBER: string = "";

// الأرقام التي أكدت الشركة أن عليها واتساب، مأخوذة من الفروع في site-data.ts.
export const WHATSAPP_CONTACTS: { branch: string; name: string; number: string }[] = branches.flatMap((b) =>
  (b.phones ?? []).filter((p) => p.whatsapp).map((p) => ({ branch: b.name, name: p.name, number: p.number })),
);

// لا توجد في الموقع أداة قياس زيارات، فلا تُرسل أي أحداث لأي جهة.
