import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Plus,
  QrCode,
  KeyRound,
  Fingerprint,
  Printer,
  Download,
  Eye,
  Building2,
  X,
} from 'lucide-react';
import { HrAttendanceRecord, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrAttendanceTabProps {
  attendanceRecords: HrAttendanceRecord[];
  employees: Employee[];
  onClockInOut: (
    colaboradorId: string,
    tipo: 'entrada' | 'saida',
    metodo: HrAttendanceRecord['metodoRegisto'],
    horaCustom?: string
  ) => void;
  onJustifyAbsence: (recordId: string, justificacao: string) => void;
  schoolName?: string;
}

export const HrAttendanceTab: React.FC<HrAttendanceTabProps> = ({
  attendanceRecords,
  employees,
  onClockInOut,
  onJustifyAbsence,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [viewMode, setViewMode] = useState<'diario' | 'mensal'>('diario');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-12');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modal de Registo de Ponto Digital
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [registoTipo, setRegistoTipo] = useState<'entrada' | 'saida'>('entrada');
  const [metodoRegisto, setMetodoRegisto] = useState<HrAttendanceRecord['metodoRegisto']>('terminal_biometrico');
  const [horaRegisto, setHoraRegisto] = useState('07:30');

  // Modal de Justificação de Falta
  const [justifyingRecord, setJustifyingRecord] = useState<HrAttendanceRecord | null>(null);
  const [justificacaoTexto, setJustificacaoTexto] = useState('');

  // Modal de Visualização de Espelho do Colaborador
  const [viewingRecord, setViewingRecord] = useState<HrAttendanceRecord | null>(null);

  const filtered = attendanceRecords.filter((a) => {
    const matchDate = viewMode === 'mensal' || !selectedDate || a.data === selectedDate;
    const matchSearch =
      a.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || a.status === statusFilter;
    return matchDate && matchSearch && matchStatus;
  });

  const presentesCount = filtered.filter((r) => r.status === 'presente').length;
  const atrasosCount = filtered.filter((r) => r.status === 'atraso').length;
  const faltasCount = filtered.filter((r) => r.status === 'falta' || r.status === 'falta_justificada').length;

  const handleConfirmClock = (e: React.FormEvent) => {
    e.preventDefault();
    onClockInOut(selectedEmpId, registoTipo, metodoRegisto, horaRegisto);
    setIsClockModalOpen(false);
  };

  const handleConfirmJustification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justifyingRecord || !justificacaoTexto) return;
    onJustifyAbsence(justifyingRecord.id, justificacaoTexto);
    setJustifyingRecord(null);
    setJustificacaoTexto('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Data',
      'Colaborador',
      'Cargo',
      'Departamento',
      'Hora_Entrada',
      'Hora_Saida',
      'Atraso_Minutos',
      'Metodo',
      'Status',
      'Justificacao',
    ];
    const rows = filtered.map((r) => [
      r.data,
      r.colaboradorNome,
      r.cargo,
      r.departamento,
      r.horaEntrada || '--',
      r.horaSaida || '--',
      r.minutosAtraso || 0,
      r.metodoRegisto,
      r.status,
      r.justificacao || '',
    ]);
    exportToCsv(`assiduidade_${viewMode}_${selectedDate}.csv`, headers, rows);
  };

  const handlePrintAttendance = () => {
    window.print();
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Topo: Indicadores & Seleção de Vista */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-500 text-[11px] block">Registos de Assiduidade</span>
          <strong className="text-xl font-bold font-mono text-gray-900 block mt-0.5">
            {filtered.length}
          </strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-500 text-[11px] block">Pontuais / Presentes</span>
          <strong className="text-xl font-bold font-mono text-emerald-600 block mt-0.5">
            {presentesCount}
          </strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-500 text-[11px] block">Atrasos Registados</span>
          <strong className="text-xl font-bold font-mono text-amber-600 block mt-0.5">
            {atrasosCount}
          </strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-500 text-[11px] block">Faltas no Período</span>
          <strong className="text-xl font-bold font-mono text-rose-600 block mt-0.5">
            {faltasCount}
          </strong>
        </div>
      </div>

      {/* Controlos e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Alternador de Modo */}
            <div className="bg-gray-100 p-0.5 rounded-lg flex items-center">
              <button
                onClick={() => setViewMode('diario')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                  viewMode === 'diario' ? 'bg-white shadow-2xs text-[#015FC4]' : 'text-gray-600'
                }`}
              >
                Ponto Diário
              </button>
              <button
                onClick={() => setViewMode('mensal')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                  viewMode === 'mensal' ? 'bg-white shadow-2xs text-[#015FC4]' : 'text-gray-600'
                }`}
              >
                Mapa Mensal Consolidado
              </button>
            </div>

            {viewMode === 'diario' && (
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1 bg-white">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs border-0 p-0 focus:ring-0 text-gray-700 font-semibold"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Exportar CSV
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrintAttendance}
              icon={<Printer className="w-3.5 h-3.5" />}
            >
              Imprimir Folha
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsClockModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Registar Ponto
            </Button>
          </div>
        </div>

        {/* Linha de Busca & Filtro */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por colaborador, cargo ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
          >
            <option value="todos">Todos os Estados</option>
            <option value="presente">Presente (Pontual)</option>
            <option value="atraso">Com Atraso</option>
            <option value="falta">Falta Injustificada</option>
            <option value="falta_justificada">Falta Justificada</option>
          </select>
        </div>
      </div>

      {/* Tabela de Assiduidade (Área com suporte a Impressão Oficial #hr-printable-area) */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center">
          <div>
            <strong className="text-gray-900 text-xs">
              {viewMode === 'diario'
                ? `Folha Diária de Presenças e Ponto · ${selectedDate}`
                : 'Mapa Geral Consolidado de Assiduidade e Pontualidade'}
            </strong>
            <span className="text-gray-400 text-[11px] block">
              {schoolName} · Controlo de Efetividade Docente e Não Docente
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">
            Total Registos: {filtered.length}
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4">Colaborador & Cargo</th>
              <th className="py-3 px-4">Departamento</th>
              <th className="py-3 px-4 text-center">Entrada</th>
              <th className="py-3 px-4 text-center">Saída</th>
              <th className="py-3 px-4 text-center">Atraso</th>
              <th className="py-3 px-4">Método do Ponto</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right no-print">Operações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map((att) => (
                <tr key={att.id} className="hover:bg-blue-50/20">
                  <td className="py-3 px-4 font-mono text-gray-600">{att.data}</td>

                  <td className="py-3 px-4">
                    <strong className="text-gray-900 block font-semibold">{att.colaboradorNome}</strong>
                    <span className="text-[10px] text-gray-400 block">{att.cargo}</span>
                  </td>

                  <td className="py-3 px-4 text-gray-700">{att.departamento}</td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-gray-900">
                    {att.horaEntrada || '--:--'}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-gray-700">
                    {att.horaSaida || '--:--'}
                  </td>

                  <td className="py-3 px-4 text-center font-mono">
                    {att.minutosAtraso ? (
                      <span className="text-amber-700 font-bold">+{att.minutosAtraso} min</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-600 capitalize">
                      {att.metodoRegisto === 'terminal_biometrico' && <Fingerprint className="w-3.5 h-3.5 text-blue-600" />}
                      {att.metodoRegisto === 'qrcode' && <QrCode className="w-3.5 h-3.5 text-teal-600" />}
                      {att.metodoRegisto === 'pin' && <KeyRound className="w-3.5 h-3.5 text-purple-600" />}
                      {att.metodoRegisto === 'manual_rh' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{att.metodoRegisto.replace('_', ' ')}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        att.status === 'presente'
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.status === 'atraso'
                          ? 'bg-amber-100 text-amber-800'
                          : att.status === 'falta_justificada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {att.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right no-print">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingRecord(att)}
                        className="px-2 py-1 rounded bg-[#015FC4]/10 hover:bg-[#015FC4] text-[#015FC4] hover:text-white font-semibold text-[10px] transition-colors flex items-center gap-1"
                        title="Visualizar Espelho do Ponto"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Espelho</span>
                      </button>

                      {(att.status === 'atraso' || att.status === 'falta') && (
                        <button
                          onClick={() => {
                            setJustifyingRecord(att);
                            setJustificacaoTexto(att.justificacao || 'Atestado médico ou dispensa de serviço entregue.');
                          }}
                          className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold text-[10px] transition-colors"
                          title="Justificar Ausência"
                        >
                          Justificar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">
                  Nenhum registo de assiduidade encontrado para a data e filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Visualizar Espelho do Ponto */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">
                  Espelho do Ponto Diário
                </strong>
                <span className="text-[11px] text-gray-500">
                  {viewingRecord.colaboradorNome} · {viewingRecord.data}
                </span>
              </div>
              <button onClick={() => setViewingRecord(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-400 text-[10px] block">Hora de Entrada</span>
                  <strong className="text-base font-bold font-mono text-gray-900">
                    {viewingRecord.horaEntrada || '--:--'}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Hora de Saída</span>
                  <strong className="text-base font-bold font-mono text-gray-900">
                    {viewingRecord.horaSaida || '--:--'}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Atraso</span>
                  <span className="font-mono font-bold text-amber-700">
                    {viewingRecord.minutosAtraso ? `${viewingRecord.minutosAtraso} minutos` : '0 min'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Método de Registo</span>
                  <span className="capitalize text-gray-800">{viewingRecord.metodoRegisto.replace('_', ' ')}</span>
                </div>
              </div>

              {viewingRecord.justificacao && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1">
                  <span className="text-blue-900 font-bold block text-[11px]">Justificação de Falta Homologada:</span>
                  <p className="text-blue-800 text-[11px] leading-relaxed">{viewingRecord.justificacao}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setViewingRecord(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registo de Ponto Digital */}
      {isClockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <strong className="text-sm font-bold text-gray-900 block">Marcação de Ponto Digital</strong>
              <button onClick={() => setIsClockModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmClock} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Colaborador *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nomeCompleto} ({e.cargoNome})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tipo de Marcação</label>
                  <select
                    value={registoTipo}
                    onChange={(e) => setRegistoTipo(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Hora do Registo</label>
                  <input
                    type="time"
                    required
                    value={horaRegisto}
                    onChange={(e) => setHoraRegisto(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Método de Identificação</label>
                <select
                  value={metodoRegisto}
                  onChange={(e) => setMetodoRegisto(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                >
                  <option value="terminal_biometrico">Biometria (Terminal de Reconhecimento)</option>
                  <option value="qrcode">QR Code Dinâmico</option>
                  <option value="pin">PIN Institucional</option>
                  <option value="manual_rh">Registo Manual pelo RH</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsClockModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirmar Ponto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Justificação de Falta */}
      {justifyingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">Homologar Justificativo de Falta</strong>
                <span className="text-[11px] text-gray-500">
                  {justifyingRecord.colaboradorNome} ({justifyingRecord.data})
                </span>
              </div>
              <button onClick={() => setJustifyingRecord(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmJustification} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Fundamentação Legal / Motivo *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Apresentação de atestado médico nos termos do Art. 148º da LGT..."
                  value={justificacaoTexto}
                  onChange={(e) => setJustificacaoTexto(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setJustifyingRecord(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Gravar Justificativo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
