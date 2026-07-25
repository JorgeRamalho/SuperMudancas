const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const TIPOS_IMOVEL = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "sobrado", label: "Sobrado" },
  { value: "comercial", label: "Comercial" },
  { value: "outro", label: "Outro" },
];

export default function AddressFields({
  prefix,
  title,
  values,
  errors,
  onChange,
  onAutofill,
}) {
  const field = (name) => `${prefix}_${name}`;

  async function handleCepBlur(event) {
    const digits = String(event.target.value || "").replace(/\D/g, "");
    if (digits.length !== 8 || !onAutofill) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.erro) return;

      onAutofill(prefix, {
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
      });
    } catch {
      /* ViaCEP indisponível — usuário preenche manualmente */
    }
  }

  return (
    <section className="form-section">
      <h2>{title}</h2>
      <span className="caption">
        Digite o CEP para preencher o endereço automaticamente (ViaCEP).
      </span>

      <div className="grid cols-3">
        <div className={`field ${errors[field("cep")] ? "has-error" : ""}`}>
          <label htmlFor={field("cep")}>CEP</label>
          <input
            id={field("cep")}
            name={field("cep")}
            inputMode="numeric"
            placeholder="00000-000"
            value={values[field("cep")]}
            onChange={onChange}
            onBlur={handleCepBlur}
            maxLength={9}
          />
          {errors[field("cep")] && <span className="hint">{errors[field("cep")]}</span>}
        </div>

        <div className={`field ${errors[field("logradouro")] ? "has-error" : ""}`} style={{ gridColumn: "span 2" }}>
          <label htmlFor={field("logradouro")}>Logradouro</label>
          <input
            id={field("logradouro")}
            name={field("logradouro")}
            value={values[field("logradouro")]}
            onChange={onChange}
          />
          {errors[field("logradouro")] && (
            <span className="hint">{errors[field("logradouro")]}</span>
          )}
        </div>
      </div>

      <div className="grid cols-3" style={{ marginTop: "1rem" }}>
        <div className={`field ${errors[field("numero")] ? "has-error" : ""}`}>
          <label htmlFor={field("numero")}>Número</label>
          <input
            id={field("numero")}
            name={field("numero")}
            value={values[field("numero")]}
            onChange={onChange}
          />
          {errors[field("numero")] && <span className="hint">{errors[field("numero")]}</span>}
        </div>
        <div className="field" style={{ gridColumn: "span 2" }}>
          <label htmlFor={field("complemento")}>Complemento</label>
          <input
            id={field("complemento")}
            name={field("complemento")}
            value={values[field("complemento")]}
            onChange={onChange}
            placeholder="Apto, bloco, sala..."
          />
        </div>
      </div>

      <div className="grid cols-3" style={{ marginTop: "1rem" }}>
        <div className={`field ${errors[field("bairro")] ? "has-error" : ""}`}>
          <label htmlFor={field("bairro")}>Bairro</label>
          <input
            id={field("bairro")}
            name={field("bairro")}
            value={values[field("bairro")]}
            onChange={onChange}
          />
          {errors[field("bairro")] && <span className="hint">{errors[field("bairro")]}</span>}
        </div>
        <div className={`field ${errors[field("cidade")] ? "has-error" : ""}`}>
          <label htmlFor={field("cidade")}>Cidade</label>
          <input
            id={field("cidade")}
            name={field("cidade")}
            value={values[field("cidade")]}
            onChange={onChange}
          />
          {errors[field("cidade")] && <span className="hint">{errors[field("cidade")]}</span>}
        </div>
        <div className={`field ${errors[field("uf")] ? "has-error" : ""}`}>
          <label htmlFor={field("uf")}>UF</label>
          <select
            id={field("uf")}
            name={field("uf")}
            value={values[field("uf")]}
            onChange={onChange}
          >
            <option value="">Selecione</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
          {errors[field("uf")] && <span className="hint">{errors[field("uf")]}</span>}
        </div>
      </div>

      <div className="grid cols-3" style={{ marginTop: "1rem" }}>
        <div className={`field ${errors[field("tipo_imovel")] ? "has-error" : ""}`}>
          <label htmlFor={field("tipo_imovel")}>Tipo de imóvel</label>
          <select
            id={field("tipo_imovel")}
            name={field("tipo_imovel")}
            value={values[field("tipo_imovel")]}
            onChange={onChange}
          >
            <option value="">Selecione</option>
            {TIPOS_IMOVEL.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors[field("tipo_imovel")] && (
            <span className="hint">{errors[field("tipo_imovel")]}</span>
          )}
        </div>
        <div className={`field ${errors[field("andares")] ? "has-error" : ""}`}>
          <label htmlFor={field("andares")}>Andares / andar</label>
          <input
            id={field("andares")}
            name={field("andares")}
            type="number"
            min="0"
            value={values[field("andares")]}
            onChange={onChange}
          />
          {errors[field("andares")] && (
            <span className="hint">{errors[field("andares")]}</span>
          )}
        </div>
        <div className={`field ${errors[field("elevador")] ? "has-error" : ""}`}>
          <label htmlFor={field("elevador")}>Elevador</label>
          <select
            id={field("elevador")}
            name={field("elevador")}
            value={values[field("elevador")]}
            onChange={onChange}
          >
            <option value="">Selecione</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          {errors[field("elevador")] && (
            <span className="hint">{errors[field("elevador")]}</span>
          )}
        </div>
      </div>
    </section>
  );
}
