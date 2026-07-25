import { useState } from "react";
import AddressFields from "../components/AddressFields.jsx";
import BrandMark from "../components/BrandMark.jsx";
import {
  formatCep,
  formatCpf,
  formatPhone,
  toPayload,
  validateSolicitacao,
} from "../utils/validation.js";

const initialValues = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  origem_cep: "",
  origem_logradouro: "",
  origem_numero: "",
  origem_complemento: "",
  origem_bairro: "",
  origem_cidade: "",
  origem_uf: "",
  origem_tipo_imovel: "",
  origem_andares: "",
  origem_elevador: "",
  destino_cep: "",
  destino_logradouro: "",
  destino_numero: "",
  destino_complemento: "",
  destino_bairro: "",
  destino_cidade: "",
  destino_uf: "",
  destino_tipo_imovel: "",
  destino_andares: "",
  destino_elevador: "",
  data_preferida: "",
  janela_horario: "",
  tipo_servico: "",
  porte: "",
  embalagem: false,
  montagem_desmontagem: false,
  itens_especiais: "",
  observacoes: "",
};

export default function SolicitacaoPage() {
  const [values, setValues] = useState(() => {
    const next = { ...initialValues };
    if (typeof window === "undefined") return next;
    const extras = new URLSearchParams(window.location.search).get("extras");
    if (!extras) return next;
    const list = extras.split("|").map((item) => item.trim());
    if (list.includes("Embalagem completa")) next.embalagem = true;
    if (list.includes("Montagem e desmontagem")) next.montagem_desmontagem = true;
    const especiais = list.filter(
      (item) =>
        item === "Itens especiais" ||
        item === "Guarda-móveis temporário" ||
        item === "Mudança noturna" ||
        item === "Seguro reforçado"
    );
    if (especiais.length) next.itens_especiais = especiais.join(", ");
    return next;
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [protocolo, setProtocolo] = useState(null);

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    let next = type === "checkbox" ? checked : value;

    if (name === "telefone") next = formatPhone(value);
    if (name === "cpf") next = formatCpf(value);
    if (name === "origem_cep" || name === "destino_cep") next = formatCep(value);

    setValues((prev) => ({ ...prev, [name]: next }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }

  function handleAutofill(prefix, fields) {
    setValues((prev) => ({
      ...prev,
      [`${prefix}_logradouro`]: fields.logradouro || prev[`${prefix}_logradouro`],
      [`${prefix}_bairro`]: fields.bairro || prev[`${prefix}_bairro`],
      [`${prefix}_cidade`]: fields.cidade || prev[`${prefix}_cidade`],
      [`${prefix}_uf`]: fields.uf || prev[`${prefix}_uf`],
    }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`${prefix}_logradouro`];
      delete copy[`${prefix}_bairro`];
      delete copy[`${prefix}_cidade`];
      delete copy[`${prefix}_uf`];
      return copy;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const nextErrors = validateSolicitacao(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values)),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível enviar a solicitação.");
      }

      setProtocolo(data.protocolo || data.id);
    } catch (err) {
      setServerError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <a className="brand-lockup" href="/" aria-label="SuperMudanças — início">
            <BrandMark className="brand-mark" size={36} />
            <span className="brand">
              Super<span>Mudanças</span>
            </span>
          </a>
          <a className="back" href="/">
            Voltar ao site
          </a>
        </div>
      </header>

      <main className="page">
        {protocolo ? (
          <div className="success">
            <h1>Solicitação recebida</h1>
            <p>
              Obrigado! Nossa equipe vai analisar os dados e entrar em contato
              para confirmar o orçamento.
            </p>
            <div className="protocol">Protocolo {protocolo}</div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a className="btn btn-primary" href="/">
                Ir para o início
              </a>
              <a className="btn btn-ghost" href="/consulta.html">
                Consultar protocolo
              </a>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setProtocolo(null);
                  setValues(initialValues);
                  setErrors({});
                }}
              >
                Nova solicitação
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="page__intro">
              <h1>Solicitar orçamento</h1>
              <p>
                Preencha os dados do cliente, endereços e detalhes do serviço
                para gerarmos sua proposta de mudança.
              </p>
            </div>

            <form className="form-card" onSubmit={handleSubmit} noValidate>
              {serverError && <div className="alert alert-error">{serverError}</div>}

              <section className="form-section">
                <h2>Dados do cliente</h2>
                <span className="caption">Informações para contato e identificação.</span>

                <div className="grid cols-2">
                  <div className={`field ${errors.nome ? "has-error" : ""}`}>
                    <label htmlFor="nome">Nome completo</label>
                    <input
                      id="nome"
                      name="nome"
                      value={values.nome}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                    {errors.nome && <span className="hint">{errors.nome}</span>}
                  </div>
                  <div className={`field ${errors.email ? "has-error" : ""}`}>
                    <label htmlFor="email">E-mail</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                    {errors.email && <span className="hint">{errors.email}</span>}
                  </div>
                </div>

                <div className="grid cols-2" style={{ marginTop: "1rem" }}>
                  <div className={`field ${errors.telefone ? "has-error" : ""}`}>
                    <label htmlFor="telefone">Telefone</label>
                    <input
                      id="telefone"
                      name="telefone"
                      inputMode="tel"
                      value={values.telefone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
                    />
                    {errors.telefone && <span className="hint">{errors.telefone}</span>}
                  </div>
                  <div className={`field ${errors.cpf ? "has-error" : ""}`}>
                    <label htmlFor="cpf">CPF</label>
                    <input
                      id="cpf"
                      name="cpf"
                      inputMode="numeric"
                      value={values.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                    />
                    {errors.cpf && <span className="hint">{errors.cpf}</span>}
                  </div>
                </div>
              </section>

              <AddressFields
                prefix="origem"
                title="Endereço de origem"
                values={values}
                errors={errors}
                onChange={handleChange}
                onAutofill={handleAutofill}
              />

              <AddressFields
                prefix="destino"
                title="Endereço de destino"
                values={values}
                errors={errors}
                onChange={handleChange}
                onAutofill={handleAutofill}
              />

              <section className="form-section">
                <h2>Detalhes do serviço</h2>
                <span className="caption">Data, tipo de mudança e necessidades extras.</span>

                <div className="grid cols-2">
                  <div className={`field ${errors.data_preferida ? "has-error" : ""}`}>
                    <label htmlFor="data_preferida">Data preferida</label>
                    <input
                      id="data_preferida"
                      name="data_preferida"
                      type="date"
                      value={values.data_preferida}
                      onChange={handleChange}
                    />
                    {errors.data_preferida && (
                      <span className="hint">{errors.data_preferida}</span>
                    )}
                  </div>
                  <div className={`field ${errors.janela_horario ? "has-error" : ""}`}>
                    <label htmlFor="janela_horario">Janela de horário</label>
                    <select
                      id="janela_horario"
                      name="janela_horario"
                      value={values.janela_horario}
                      onChange={handleChange}
                    >
                      <option value="">Selecione</option>
                      <option value="manha">Manhã (8h–12h)</option>
                      <option value="tarde">Tarde (13h–18h)</option>
                      <option value="integral">Dia integral</option>
                      <option value="flexivel">Flexível</option>
                    </select>
                    {errors.janela_horario && (
                      <span className="hint">{errors.janela_horario}</span>
                    )}
                  </div>
                </div>

                <div className="grid cols-2" style={{ marginTop: "1rem" }}>
                  <div className={`field ${errors.tipo_servico ? "has-error" : ""}`}>
                    <label htmlFor="tipo_servico">Tipo de serviço</label>
                    <select
                      id="tipo_servico"
                      name="tipo_servico"
                      value={values.tipo_servico}
                      onChange={handleChange}
                    >
                      <option value="">Selecione</option>
                      <option value="residencial">Residencial</option>
                      <option value="comercial">Comercial</option>
                      <option value="escritorio">Escritório</option>
                    </select>
                    {errors.tipo_servico && (
                      <span className="hint">{errors.tipo_servico}</span>
                    )}
                  </div>
                  <div className={`field ${errors.porte ? "has-error" : ""}`}>
                    <label htmlFor="porte">Porte do imóvel</label>
                    <select
                      id="porte"
                      name="porte"
                      value={values.porte}
                      onChange={handleChange}
                    >
                      <option value="">Selecione</option>
                      <option value="kitnet">Kitnet / studio</option>
                      <option value="1_quarto">1 quarto</option>
                      <option value="2_quartos">2 quartos</option>
                      <option value="3_mais">3+ quartos</option>
                    </select>
                    {errors.porte && <span className="hint">{errors.porte}</span>}
                  </div>
                </div>

                <div className="check-row" style={{ marginTop: "1rem" }}>
                  <label className="check">
                    <input
                      type="checkbox"
                      name="embalagem"
                      checked={values.embalagem}
                      onChange={handleChange}
                    />
                    Serviço de embalagem
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      name="montagem_desmontagem"
                      checked={values.montagem_desmontagem}
                      onChange={handleChange}
                    />
                    Montagem / desmontagem
                  </label>
                </div>

                <div className="field" style={{ marginTop: "1rem" }}>
                  <label htmlFor="itens_especiais">Itens frágeis ou especiais</label>
                  <textarea
                    id="itens_especiais"
                    name="itens_especiais"
                    value={values.itens_especiais}
                    onChange={handleChange}
                    placeholder="Ex.: piano, aquário, geladeira side-by-side..."
                  />
                </div>

                <div className="field" style={{ marginTop: "1rem" }}>
                  <label htmlFor="observacoes">Observações</label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={values.observacoes}
                    onChange={handleChange}
                    placeholder="Restrições de horário, acesso, estacionamento..."
                  />
                </div>
              </section>

              <div className="form-actions">
                <p className="caption" style={{ margin: 0 }}>
                  Ao enviar, você recebe um protocolo de acompanhamento.
                </p>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar solicitação"}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
