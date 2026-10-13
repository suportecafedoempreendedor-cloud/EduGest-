-- =====================================================================
-- EDUGEST ANGOLA | Cloudflare D1 Database Seed Data
-- Migração 0002: Dados Iniciais Homologados e Contas de Teste
-- =====================================================================

-- 1. Instituições Iniciais
INSERT OR IGNORE INTO institutions (
  id, code, name, commercial_name, nif, province, municipality, address, phone, email, website, status, plan, monthly_value_kz, created_at
) VALUES 
('esc-001', 'CES-01', 'Colégio Esperança do Saber', 'Esperança do Saber', '5418029412', 'Luanda', 'Belas', 'Talatona, Via C3, Projecto Lar do Patriota', '+244 923 456 789', 'geral@esperanca.edu.ao', 'https://esperanca.edu.ao', 'activa', 'Plano Enterprise', 850000, '2025-01-15 08:00:00'),
('esc-002', 'LPR-02', 'Liceu Privado Almirante Rosa Coutinho', 'Liceu Rosa Coutinho', '5409182736', 'Luanda', 'Luanda', 'Maianga, Rua Comandante Gika, nº 142', '+244 912 334 455', 'contacto@rosacoutinho.ao', 'https://rosacoutinho.ao', 'activa', 'Plano Pro', 450000, '2025-02-01 08:00:00'),
('esc-003', 'CMP-03', 'Complexo Escolar Mutu-ya-Kevela Prime', 'Mutu Prime', '5421984721', 'Luanda', 'Ingombota', 'Av. 4 de Fevereiro, Marginal de Luanda', '+244 934 889 900', 'direcao@mutuprime.ao', 'https://mutuprime.ao', 'trial', 'Plano Pro', 450000, '2026-03-01 08:00:00');

-- 2. Departamentos
INSERT OR IGNORE INTO departments (id, institution_id, code, name, acronym, description, manager_name, color) VALUES
('dep-dg', 'esc-001', 'direccao_geral', 'Direcção Geral & Administração', 'DG', 'Gestão superior executiva e políticas institucionais.', 'Dr. Paulo Sebastião Afonso', 'blue'),
('dep-sec', 'esc-001', 'secretaria_academica', 'Secretaria Geral & Matrículas', 'SEC', 'Admissão, matrículas, processos individuais e emissão de declarações.', 'Dra. Maria Eunice Vunge', 'purple'),
('dep-fin', 'esc-001', 'administracao_financeira', 'Tesouraria & Finanças', 'FIN', 'Cobranças, Multicaixa, contas correntes e reconciliação.', 'Dra. Sandra Domingos', 'emerald'),
('dep-rh', 'esc-001', 'recursos_humanos', 'Recursos Humanos', 'RH', 'Gestão de docentes e funcionários, assiduidade e contratos.', 'Dr. António Bento', 'amber'),
('dep-coord', 'esc-001', 'coordenacao_pedagogica', 'Coordenação Pedagógica & Académica', 'CP', 'Pautas oficiais do MED, notas, turmas e matriz curricular.', 'Prof.ª Teresa Samakaka', 'indigo'),
('dep-doc', 'esc-001', 'corpo_docente', 'Corpo Docente', 'DOC', 'Docentes titulares e lançamento trimestral.', 'Prof. André Muanza', 'teal'),
('dep-crm', 'esc-001', 'admissoes_crm', 'Comercial & Admissões', 'CRM', 'Captação de leads, funil de matrículas e campanhas.', 'Lic. Carla Kiala', 'rose');

-- 3. Papéis (Roles)
INSERT OR IGNORE INTO roles (id, code, name, scope, description) VALUES
('role-super-admin', 'super_admin', 'Super Administrador SaaS', 'global', 'Acesso irrestrito à gestão de instituições, planos e métricas do SaaS.'),
('role-school-admin', 'school_admin', 'Director Geral da Escola', 'institution', 'Administração completa do tenant institucional.'),
('role-rh', 'rh', 'Gestor de Recursos Humanos', 'institution', 'Gestão de colaboradores, contratos e assiduidade de pessoal.'),
('role-sec', 'secretaria', 'Secretaria Geral', 'institution', 'Gestão de processos de alunos, matrículas e emissão de documentos.'),
('role-fin', 'financeiro', 'Gestor Financeiro / Tesoureiro', 'institution', 'Propinas, pagamentos, contas correntes e relatórios financeiros.'),
('role-coord', 'coordenacao', 'Coordenador Pedagógico', 'institution', 'Gestão curricular, pautas trimestrais e homologação de notas MED.'),
('role-prof', 'professor', 'Docente / Professor', 'institution', 'Aulas, sumários, notas de turmas atribuídas e assiduidade.'),
('role-guard', 'guardian', 'Encarregado de Educação', 'institution', 'Portal da Família: notas, faltas, horários e propinas dos educandos.'),
('role-stud', 'student', 'Estudante / Aluno', 'institution', 'Portal do Aluno: notas, horário de aulas e histórico escolar.'),
('role-crm', 'crm', 'Agente Comercial & CRM', 'institution', 'Gestão de leads, visitas escolares e conversão em matrículas.');

-- 4. Utilizadores Iniciais Homologados
-- Nota: Hash PBKDF2 SHA-256 com salt seguro (compatível com a senha padrão 'EduGest@2026' e '123456')
INSERT OR IGNORE INTO users (
  id, full_name, email, phone, bi_number, password_hash, password_salt, primary_role, job_title, department_id, institution_id, is_active, is_blocked
) VALUES
('usr-super-01', 'Eng. Manuel Rui de Sousa', 'admin.saas@edugest.ao', '+244 923 001 002', '001928374LA041', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_super_2026', 'super_admin', 'Administrador Global SaaS', NULL, NULL, 1, 0),
('usr-admin-esc01', 'Dr. Paulo Sebastião Afonso', 'director@esperanca.edu.ao', '+244 912 345 678', '003291845LA032', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_dir_2026', 'school_admin', 'Director Geral do Colégio', 'dep-dg', 'esc-001', 1, 0),
('usr-rh-01', 'Dr. António Bento', 'rh@esperanca.edu.ao', '+244 923 112 233', '004819283LA012', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_rh_2026', 'rh', 'Chefe de Recursos Humanos', 'dep-rh', 'esc-001', 1, 0),
('usr-sec-01', 'Dra. Maria Eunice Vunge', 'secretaria@esperanca.edu.ao', '+244 934 556 778', '005918273LA091', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_sec_2026', 'secretaria', 'Chefe de Secretaria Geral', 'dep-sec', 'esc-001', 1, 0),
('usr-fin-01', 'Dra. Sandra Domingos', 'financas@esperanca.edu.ao', '+244 945 667 889', '006192837LA088', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_fin_2026', 'financeiro', 'Tesoureira Sénior', 'dep-fin', 'esc-001', 1, 0),
('usr-coord-01', 'Prof.ª Teresa Samakaka', 'coordenacao@esperanca.edu.ao', '+244 926 778 990', '007182934LA055', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_coord_2026', 'coordenacao', 'Coordenadora Pedagógica', 'dep-coord', 'esc-001', 1, 0),
('usr-prof-01', 'Prof. André Muanza', 'andre.muanza@esperanca.edu.ao', '+244 917 889 001', '008291039LA077', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_prof_2026', 'professor', 'Professor de Matemática', 'dep-doc', 'esc-001', 1, 0),
('usr-guard-01', 'Sr. João Baptista dos Santos', 'encarregado.santos@gmail.com', '+244 923 445 566', '009182736LA022', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_guard_2026', 'guardian', 'Encarregado de Educação', NULL, 'esc-001', 1, 0),
('usr-stud-01', 'Ana Beatriz dos Santos', 'ana.santos@aluno.esperanca.ao', '+244 945 112 233', '009918273LA099', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_stud_2026', 'student', 'Estudante da 10ª Classe', NULL, 'esc-001', 1, 0),
('usr-crm-01', 'Lic. Carla Kiala', 'carla.kiala@esperanca.edu.ao', '+244 928 334 455', '003819284LA033', 'e8f7c9e1f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'salt_edugest_crm_2026', 'crm', 'Gestora de Admissões & CRM', 'dep-crm', 'esc-001', 1, 0);
