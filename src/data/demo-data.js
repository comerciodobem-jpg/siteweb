export const DEMO_COMPANY_ID = 'empresa-demo';

export const demoUsers = [
  { id: 'u-joao', employeeId: 'e-joao', name: 'João Produção', role: 'operator', initials: 'JP', pin: '1111' },
  { id: 'u-maria', employeeId: 'e-maria', name: 'Maria Produção', role: 'operator', initials: 'MP', pin: '2222' },
  { id: 'u-gestor', employeeId: 'e-gestor', name: 'Gestor Produção', role: 'manager', initials: 'GP', pin: '9999' }
];

export const demoMaterials = [
  { id: 'm-colorau', name: 'Colorau a granel', unit: 'kg' },
  { id: 'm-pote100', name: 'Pote 100 g', unit: 'un' },
  { id: 'm-tampa100', name: 'Tampa 100 g', unit: 'un' },
  { id: 'm-rotulo-colorau', name: 'Rótulo Colorau', unit: 'un' },
  { id: 'm-tempero', name: 'Blend Tempero Completo', unit: 'kg' },
  { id: 'm-pote300', name: 'Pote 300 g', unit: 'un' }
];

export const demoProducts = [
  {
    id: 'p-colorau-100', sku: 'COL100', name: 'Colorau', presentation: '100 g', barcode: '7891000000011', control_unit: 'un', icon: '🌶️', package_conversion: { name: 'caixa', multiplier: 24 },
    technical_sheet: { version: 1, items: [
      { material_id: 'm-colorau', quantity_per_unit: 0.1 },
      { material_id: 'm-pote100', quantity_per_unit: 1 },
      { material_id: 'm-tampa100', quantity_per_unit: 1 },
      { material_id: 'm-rotulo-colorau', quantity_per_unit: 1 }
    ] }
  },
  {
    id: 'p-tempero-300', sku: 'TEMP300', name: 'Tempero Completo', presentation: '300 g', barcode: '7891000000028', control_unit: 'un', icon: '🧂', package_conversion: { name: 'caixa', multiplier: 12 },
    technical_sheet: { version: 1, items: [
      { material_id: 'm-tempero', quantity_per_unit: 0.3 },
      { material_id: 'm-pote300', quantity_per_unit: 1 }
    ] }
  },
  {
    id: 'p-parrilla-500', sku: 'PAR500', name: 'Sal de Parrilla Ervas Finas', presentation: '500 g', barcode: '7891000000035', control_unit: 'un', icon: '🥩', package_conversion: { name: 'caixa', multiplier: 12 },
    technical_sheet: { version: 1, items: [] }
  },
  {
    id: 'p-alho-200', sku: 'ALH200', name: 'Alho Granulado', presentation: '200 g', barcode: '7891000000042', control_unit: 'un', icon: '🧄', package_conversion: { name: 'caixa', multiplier: 12 },
    technical_sheet: { version: 1, items: [] }
  }
];

const now = new Date();
const isoAt = (daysAgo, hour, minute = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export function createDemoState() {
  return {
    version: 1,
    productionRecords: [
      { id:'seed-1', company_id:DEMO_COMPANY_ID, user_id:'u-joao', employee_id:'e-joao', product_id:'p-colorau-100', barcode:'7891000000011', declared_quantity:420, unit:'un', recorded_at:isoAt(0,9,10), sync_status:'SYNCED', review_status:'PENDING_REVIEW', idempotency_key:'seed-1' },
      { id:'seed-2', company_id:DEMO_COMPANY_ID, user_id:'u-maria', employee_id:'e-maria', product_id:'p-colorau-100', barcode:'7891000000011', declared_quantity:380, unit:'un', recorded_at:isoAt(0,11,20), sync_status:'SYNCED', review_status:'PENDING_REVIEW', idempotency_key:'seed-2' },
      { id:'seed-3', company_id:DEMO_COMPANY_ID, user_id:'u-joao', employee_id:'e-joao', product_id:'p-tempero-300', barcode:'7891000000028', declared_quantity:180, unit:'un', recorded_at:isoAt(1,15,0), sync_status:'SYNCED', review_status:'CONFIRMED', idempotency_key:'seed-3' },
      { id:'seed-4', company_id:DEMO_COMPANY_ID, user_id:'u-maria', employee_id:'e-maria', product_id:'p-parrilla-500', barcode:'7891000000035', declared_quantity:240, unit:'un', recorded_at:isoAt(2,10,0), sync_status:'SYNCED', review_status:'CONFIRMED', idempotency_key:'seed-4' },
      { id:'seed-5', company_id:DEMO_COMPANY_ID, user_id:'u-joao', employee_id:'e-joao', product_id:'p-alho-200', barcode:'7891000000042', declared_quantity:210, unit:'un', recorded_at:isoAt(3,13,30), sync_status:'SYNCED', review_status:'CONFIRMED', idempotency_key:'seed-5' }
    ],
    productionReviews: [
      { id:'seed-rv-1', company_id:DEMO_COMPANY_ID, product_id:'p-tempero-300', record_ids:['seed-3'], declared_total:180, confirmed_quantity:180, difference_quantity:0, reviewer_user_id:'u-gestor', reviewed_at:isoAt(1,17,10), status:'CONFIRMED', contributors:{'e-joao':180}, idempotency_key:'seed-rv-1' },
      { id:'seed-rv-2', company_id:DEMO_COMPANY_ID, product_id:'p-parrilla-500', record_ids:['seed-4'], declared_total:240, confirmed_quantity:240, difference_quantity:0, reviewer_user_id:'u-gestor', reviewed_at:isoAt(2,17,5), status:'CONFIRMED', contributors:{'e-maria':240}, idempotency_key:'seed-rv-2' },
      { id:'seed-rv-3', company_id:DEMO_COMPANY_ID, product_id:'p-alho-200', record_ids:['seed-5'], declared_total:210, confirmed_quantity:210, difference_quantity:0, reviewer_user_id:'u-gestor', reviewed_at:isoAt(3,17,20), status:'CONFIRMED', contributors:{'e-joao':210}, idempotency_key:'seed-rv-3' }
    ],
    productionNeeds: [
      { id:'need-colorau', company_id:DEMO_COMPANY_ID, product_id:'p-colorau-100', target_quantity:4500, priority:'URGENT', status:'OPEN', note:'Cliente especial — prioridade de produção', created_at:isoAt(0,7,0) }
    ],
    stockMovements: [],
    materialStock: { 'm-colorau': 300, 'm-pote100': 3200, 'm-tampa100': 3300, 'm-rotulo-colorau': 3100, 'm-tempero': 120, 'm-pote300': 900 },
    shortages: []
  };
}
