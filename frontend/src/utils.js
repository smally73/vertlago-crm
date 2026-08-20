// Un contact peut n'être connu que par son email ou son Instagram (pas de nom).
export function clientDisplayName(client) {
  const name = [client.first_name, client.last_name].filter(Boolean).join(' ');
  return name || client.email || client.instagram || 'Contact sans nom';
}
