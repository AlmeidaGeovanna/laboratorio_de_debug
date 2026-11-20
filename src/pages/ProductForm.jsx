import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProductById, updateProduct } from '../services/productService'

const initialForm = {
  name: '',
  category: '',
  price: '',
  quantity: '',
}

function validate(form) {
  const errors = {}
  if (!String(form.name).trim()) errors.name = 'Informe o nome do produto.'
  if (!String(form.category).trim()) errors.category = 'Informe a categoria do produto.'

  const price = String(form.price).trim()
  if (price === '') errors.price = 'Informe o preço.'
  else if (!Number.isFinite(Number(price))) errors.price = 'O preço deve ser um número.'
  else if (Number(price) < 0) errors.price = 'O preço não pode ser negativo.'

  const quantity = String(form.quantity).trim()
  if (quantity === '') errors.quantity = 'Informe a quantidade.'
  else if (!Number.isFinite(Number(quantity))) errors.quantity = 'A quantidade deve ser um número.'
  else if (Number(quantity) < 0) errors.quantity = 'A quantidade não pode ser negativa.'
  else if (!Number.isInteger(Number(quantity))) errors.quantity = 'A quantidade deve ser um número inteiro.'

  return errors
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(isEditing)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    setError('')
    setFieldErrors({})
    setForm(initialForm)

    if (!isEditing) {
      setLoading(false)
      return
    }

    let ignore = false
    setLoading(true)

    async function loadProduct() {
      try {
        const product = await getProductById(id)
        if (ignore) return
        setForm({
          name: product.name ?? '',
          category: product.category ?? '',
          price: product.price ?? '',
          quantity: product.quantity ?? '',
        })
      } catch (err) {
        if (!ignore) setError(err.message || 'Erro ao buscar produto.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadProduct()
    return () => {
      ignore = true
    }
  }, [id, isEditing])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError('Corrija os campos destacados antes de salvar.')
      return
    }

    const product = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }

    try {
      if (isEditing) {
        await updateProduct(id, product)
      } else {
        await createProduct(product)
      }
      navigate('/products')
    } catch (err) {
      setError(err.message || 'Erro ao salvar produto.')
    }
  }

  if (loading) return <p className="feedback">Carregando dados do produto...</p>

  return (
    <section className="form-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CADASTRO</span>
          <h2>{isEditing ? 'Editar produto' : 'Novo produto'}</h2>
          <p>Preencha os dados para manter o estoque atualizado.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="product-form" onSubmit={handleSubmit} noValidate>
        <label>
          Nome do produto
          <input name="name" className={fieldErrors.name ? 'invalid' : undefined} value={form.name} onChange={handleChange} placeholder="Ex.: Teclado mecânico" />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </label>

        <label>
          Categoria
          <input name="category" className={fieldErrors.category ? 'invalid' : undefined} value={form.category} onChange={handleChange} placeholder="Ex.: Periféricos" />
          {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
        </label>

        <div className="form-row">
          <label>
            Preço (R$)
            <input name="price" type="number" min="0" step="0.01" className={fieldErrors.price ? 'invalid' : undefined} value={form.price} onChange={handleChange} placeholder="0,00" />
            {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
          </label>
          <label>
            Quantidade
            <input name="quantity" type="number" min="0" step="1" className={fieldErrors.quantity ? 'invalid' : undefined} value={form.quantity} onChange={handleChange} placeholder="0" />
            {fieldErrors.quantity && <span className="field-error">{fieldErrors.quantity}</span>}
          </label>
        </div>

        <div className="form-actions">
          <Link className="button secondary" to="/products">Cancelar</Link>
          <button className="button primary" type="submit">{isEditing ? 'Salvar alterações' : 'Cadastrar produto'}</button>
        </div>
      </form>
    </section>
  )
}