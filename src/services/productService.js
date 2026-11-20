const API_URL = 'http://localhost:3001'

const CONNECTION_ERROR =
  'Não foi possível conectar à API. Verifique se o JSON Server está rodando na porta 3001.'

async function apiFetch(url, options) {
  try {
    return await fetch(url, options)
  } catch {
    throw new Error(CONNECTION_ERROR)
  }
}

export async function getProducts() {
  const response = await apiFetch(`${API_URL}/products`)
  if (!response.ok) throw new Error('Não foi possível carregar os produtos.')
  return response.json()
}

export async function getProductById(id) {
  const response = await apiFetch(`${API_URL}/products/${id}`)
  if (!response.ok) throw new Error('Produto não encontrado.')
  return response.json()
}

export async function createProduct(product) {
  const response = await apiFetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  if (!response.ok) throw new Error('Não foi possível cadastrar o produto.')
  return response.json()
}

export async function updateProduct(id, product) {
  const response = await apiFetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...product, id }),
  })
  if (!response.ok) throw new Error('Não foi possível atualizar o produto.')
  return response.json()
}

export async function deleteProduct(id) {
  const response = await apiFetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Não foi possível excluir o produto.')
  return true
}