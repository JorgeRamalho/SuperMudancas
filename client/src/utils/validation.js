function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function formatCep(value) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function isValidCpf(cpf) {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === Number(digits[10]);
}

function required(value) {
  return String(value || "").trim().length > 0;
}

function validateAddress(prefix, values, errors) {
  const fields = [
    "cep",
    "logradouro",
    "numero",
    "bairro",
    "cidade",
    "uf",
    "tipo_imovel",
    "andares",
    "elevador",
  ];

  fields.forEach((name) => {
    const key = `${prefix}_${name}`;
    if (!required(values[key])) {
      errors[key] = "Campo obrigatório";
    }
  });

  const cepKey = `${prefix}_cep`;
  if (required(values[cepKey]) && onlyDigits(values[cepKey]).length !== 8) {
    errors[cepKey] = "CEP inválido";
  }
}

export function validateSolicitacao(values) {
  const errors = {};

  if (!required(values.nome)) errors.nome = "Informe o nome completo";
  if (!required(values.email)) {
    errors.email = "Informe o e-mail";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "E-mail inválido";
  }

  if (!required(values.telefone) || onlyDigits(values.telefone).length < 10) {
    errors.telefone = "Telefone inválido";
  }

  if (!required(values.cpf) || !isValidCpf(values.cpf)) {
    errors.cpf = "CPF inválido";
  }

  validateAddress("origem", values, errors);
  validateAddress("destino", values, errors);

  if (!required(values.data_preferida)) {
    errors.data_preferida = "Escolha uma data";
  }

  if (!required(values.janela_horario)) {
    errors.janela_horario = "Selecione o horário";
  }

  if (!required(values.tipo_servico)) {
    errors.tipo_servico = "Selecione o tipo";
  }

  if (!required(values.porte)) {
    errors.porte = "Selecione o porte";
  }

  return errors;
}

export function toPayload(values) {
  return {
    nome: values.nome.trim(),
    email: values.email.trim().toLowerCase(),
    telefone: onlyDigits(values.telefone),
    cpf: onlyDigits(values.cpf),
    origem_cep: onlyDigits(values.origem_cep),
    origem_logradouro: values.origem_logradouro.trim(),
    origem_numero: values.origem_numero.trim(),
    origem_complemento: values.origem_complemento.trim(),
    origem_bairro: values.origem_bairro.trim(),
    origem_cidade: values.origem_cidade.trim(),
    origem_uf: values.origem_uf,
    origem_tipo_imovel: values.origem_tipo_imovel,
    origem_andares: Number(values.origem_andares),
    origem_elevador: values.origem_elevador === "sim",
    destino_cep: onlyDigits(values.destino_cep),
    destino_logradouro: values.destino_logradouro.trim(),
    destino_numero: values.destino_numero.trim(),
    destino_complemento: values.destino_complemento.trim(),
    destino_bairro: values.destino_bairro.trim(),
    destino_cidade: values.destino_cidade.trim(),
    destino_uf: values.destino_uf,
    destino_tipo_imovel: values.destino_tipo_imovel,
    destino_andares: Number(values.destino_andares),
    destino_elevador: values.destino_elevador === "sim",
    data_preferida: values.data_preferida,
    janela_horario: values.janela_horario,
    tipo_servico: values.tipo_servico,
    porte: values.porte,
    embalagem: Boolean(values.embalagem),
    montagem_desmontagem: Boolean(values.montagem_desmontagem),
    itens_especiais: values.itens_especiais.trim(),
    observacoes: values.observacoes.trim(),
  };
}
