import React from 'react';
import {
  Printer,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  X,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Student } from '../../types';
import { NotaAcademicaCompleta, PeriodoLectivoConfig } from '../../types/academicModule';
import { classificarAproveitamento } from '../../services/academicGradingEngine';

interface BoletimDigitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  notas: NotaAcademicaCompleta[];
  periodos: PeriodoLectivoConfig[];
  schoolName: string;
}

export const BoletimDigitalModal: React.FC<BoletimDigitalModalProps> = ({
  isOpen,
  onClose,
  student,
  notas,
  periodos,
  schoolName,
}) => {
  if (!student) return null;

  // Filtrar notas deste aluno
  const studentNotas = notas.filter((n) => n.alunoId === student.id);

  // Média global
  const somaMedias = studentNotas.reduce((acc, curr) => acc + curr.mt, 0);
  const mediaGlobal = studentNotas.length > 0 ? (somaMedias / studentNotas.length).toFixed(1) : '---';
  const mediaNum = Number(mediaGlobal);
  const statusAproveitamento = !isNaN(mediaNum)
    ? classificarAproveitamento(mediaNum)
    : { classificacao: 'Pendente', corBadge: 'gray', aprovado: false };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Boletim Digital de Notas · ${student.nomeCompleto}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs printable-content">
        {/* Cabeçalho Oficial do Boletim */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#012041] to-[#015FC4] text-white space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-300" />
              <span className="font-bold tracking-wide uppercase text-[11px] text-blue-200">
                {schoolName} · Ministério da Educação (MED)
              </span>
            </div>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono">
              Ano Lectivo {student.anoLectivo}
            </span>
          </div>

          <div className="pt-2 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-blue-200 block text-[10px]">Aluno:</span>
              <strong className="text-white block truncate">{student.nomeCompleto}</strong>
            </div>
            <div>
              <span className="text-blue-200 block text-[10px]">Nº Processo:</span>
              <span className="font-mono text-white">{student.processo}</span>
            </div>
            <div>
              <span className="text-blue-200 block text-[10px]">Turma:</span>
              <span className="text-white">{student.turmaNome}</span>
            </div>
            <div>
              <span className="text-blue-200 block text-[10px]">BI / Cédula:</span>
              <span className="font-mono text-white">{student.bi || student.documentoIdentificacao}</span>
            </div>
          </div>
        </div>

        {/* Tabela de Notas por Disciplina */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200 uppercase text-[10px]">
                <th className="py-2.5 px-3">Disciplina</th>
                <th className="py-2.5 px-2 text-center">MAC (30%)</th>
                <th className="py-2.5 px-2 text-center">NPP (30%)</th>
                <th className="py-2.5 px-2 text-center">NPT (40%)</th>
                <th className="py-2.5 px-2 text-center">Média Trim.</th>
                <th className="py-2.5 px-3 text-center">Classificação</th>
                <th className="py-2.5 px-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {studentNotas.map((n) => {
                const classif = classificarAproveitamento(n.mt);
                return (
                  <tr key={n.id} className="hover:bg-gray-50/75">
                    <td className="py-2 px-3 font-sans font-semibold text-gray-900">
                      {n.disciplinaNome}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-700">
                      {n.mac.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-700">
                      {n.npp.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-700">
                      {n.npt.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-sm">
                      <span className={n.mt >= 10 ? 'text-[#015FC4]' : 'text-rose-600'}>
                        {n.mt.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-sans text-[11px]">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold ${
                          n.mt >= 14
                            ? 'bg-emerald-50 text-emerald-800'
                            : n.mt >= 10
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {classif.classificacao}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-sans text-[10px]">
                      <span
                        className={`capitalize font-bold ${
                          n.estado === 'aprovada'
                            ? 'text-emerald-700'
                            : n.estado === 'submetida'
                            ? 'text-amber-700'
                            : 'text-gray-500'
                        }`}
                      >
                        {n.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Resumo Estatístico do Aproveitamento */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-gray-500 text-xs block">Média Geral Ponderada do Aluno:</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-[#012041] font-mono">
                {mediaGlobal} valores
              </span>
              <span className="text-xs text-gray-500">(Escala 0 a 20 do MED)</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-gray-500 text-xs block">Veredito do Conselho Pedagógico:</span>
            <span className="text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded inline-block mt-0.5">
              {statusAproveitamento.classificacao}
            </span>
          </div>
        </div>

        {/* Assinaturas Digitais e Validação */}
        <div className="pt-4 border-t border-gray-200 grid grid-cols-2 text-center text-[10px] text-gray-500">
          <div>
            <div className="h-8 border-b border-gray-300 w-36 mx-auto mb-1"></div>
            <span>Director de Turma</span>
          </div>
          <div>
            <div className="h-8 border-b border-gray-300 w-36 mx-auto mb-1"></div>
            <span>Coordenação Pedagógica</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-400">
            Documento autenticado electronicamente pelo Sistema Oficial EduGest Angola.
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Fechar
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Imprimir Boletim Oficial
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
