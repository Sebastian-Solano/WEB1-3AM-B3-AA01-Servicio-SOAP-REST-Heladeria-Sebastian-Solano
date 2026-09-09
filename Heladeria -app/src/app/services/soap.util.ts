export function escapeXml(value: unknown): string {
  return String(value ?? '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);
}

export function leerSoap(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('El servicio devolvió XML inválido.');
  const fault = doc.getElementsByTagNameNS('*', 'Fault')[0];
  if (fault) throw new Error(fault.getElementsByTagName('faultstring')[0]?.textContent || 'No se pudo completar la operación.');
  return doc;
}

export function objetosSoap<T>(doc: Document, tipo: string): T[] {
  return Array.from(doc.getElementsByTagNameNS('*', tipo)).map(node => Object.fromEntries(Array.from(node.children).map(c => {
    const name = c.localName;
    const value = c.textContent || '';
    return [name[0].toLowerCase() + name.slice(1), name === 'Estado' ? value === 'true' : /^(Id|Precio|Stock)/.test(name) ? Number(value) : value];
  }))) as T[];
}

export function serializarContrato(valor: object): string {
  return Object.entries(valor).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => {
    const nombre = key[0].toUpperCase() + key.slice(1);
    return `<d:${nombre}>${escapeXml(value)}</d:${nombre}>`;
  }).join('');
}
