import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  User,
  FileText,
  Award,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Student, NotaItem } from '../../types';

interface StudentPortalViewProps {
  currentStudent: Student;
  notas: NotaItem[];
  schoolName: string;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentStudent,
  notas,
  schoolName,
}) => {
  const [activeTab, setActiveTab] = useState<'notas' | 'horario' | 'comunicados'>('notas');

  const studentNotas = notas.filter((n) => n.alunoId === currentStudent.id);
  const mediaGeral =
    studentNotas.length > 0
      ? (studentNotas.reduce((sum, n) => sum + n.mt, 0) / studentNotas.length).toFixed(1)
      : '14.2';

  const mockHorario = [
    { dia: 'Segunda-feira', aulas: ['07:30 - Matemática', '09:10 - Física', '11:00 - Língua Portuguesa'] },
    { dia: 'Terça-feira', aulas: ['07:30 - Química', '09:10 - Biologia', '11:00 - Inglês'] },
    { dia: 'Quarta-feira', aulas: ['07:30 - Matemática', '09:10 - Geometria Descritiva', '11:00 - F.A.I.'] },
    { dia: 'Quinta-feira', aulas: ['07:30 - Física Experimental', '09:10 - Química', '11:00 - Educação Física'] },
    { dia: 'Sexta-feira', aulas: ['07:30 - Língua Portuguesa', '09:10 - Filosofia', '11:00 - TIC / Informática'] },
  ];

  return (
    <div className="space-y-6">
      {/* Banner do Aluno */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] rounded-xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <span>{schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>Portal do Estudante</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {currentStudent.nomeCompleto}!
            </h1>
            <p className="text-xs text-blue-100">
              Nº Processo: <strong className="font-mono">{currentStudent.processo}</strong> ·{' '}
              {currentStudent.turmaNome} ({currentStudent.classe})
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">
              Média Geral Trimestral
            </span>
            <span className="text-3xl font-black text-white font-mono">{mediaGeral}</span>
            <span className="text-[10px] text-emerald-300 block font-semibold">
              Transição Positiva
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/15">
          <button
            onClick={() => setActiveTab('notas')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'notas'
                ? 'bg-white text-[#012041] shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Boletim de Notas
          </button>
          <button
            onClick={() => setActiveTab('horario')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'horario'
                ? 'bg-white text-[#012041] shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Horário Semanal de Aulas
          </button>
          <button
            onClick={() => setActiveTab('comunicados')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'comunicados'
                ? 'bg-white text-[#012041] shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Comunicados & Avisos
          </button>
        </div>
      </div>

      {activeTab === 'notas' && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Aproveitamento por Disciplina (2º Trimestre)
              </h2>
              <span className="text-xs text-gray-500 font-mono">Ano Lectivo {currentStudent.anoLectivo}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Disciplina</th>
                    <th className="py-2.5 px-2 text-center">MAC (30%)</th>
                    <th className="py-2.5 px-2 text-center">NPP (30%)</th>
                    <th className="py-2.5 px-2 text-center">NPT (40%)</th>
                    <th className="py-2.5 px-2 text-center">Média Trimestral</th>
                    <th className="py-2.5 px-3 text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {studentNotas.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-sans font-semibold text-gray-900">
                        {n.disciplina}
                      </td>
                      <td className="py-2.5 px-2 text-center text-gray-700">{n.mac.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-center text-gray-700">{n.npp.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-center text-gray-700">{n.npt.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-sm">
                        <span className={n.mt >= 10 ? 'text-[#015FC4]' : 'text-rose-600'}>
                          {n.mt.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            n.mt >= 10
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {n.mt >= 10 ? 'Aprovado' : 'Abaixo da Média'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'horario' && (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-base font-bold text-[#012041] pb-2 border-b border-gray-100">
              Grade Semanal de Aulas (Período da Manhã)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {mockHorario.map((d, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
                  <span className="font-bold text-xs text-[#015FC4] block border-b border-gray-200 pb-1">
                    {d.dia}
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-gray-700">
                    {d.aulas.map((aula, aIdx) => (
                      <li key={aIdx} className="bg-white p-1.5 rounded border border-gray-200 shadow-2xs">
                        {aula}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'comunicados' && (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-base font-bold text-[#012041] pb-2 border-b border-gray-100">
              Comunicados Institucionais
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-xs text-gray-700 space-y-1">
                <span className="font-bold text-[#012041] block">
                  Provas Trimestrais do 2º Trimestre Lectivo
                </span>
                <p>
                  Informamos a todos os estudantes que o calendário oficial de provas trimestrais
                  inicia no dia 23 de Março. Por favor, regularizem a situação das folhas de prova.
                </p>
                <span className="text-[10px] text-gray-400 block pt-1">
                  Publicado pela Direcção Pedagógica a 10 de Março de 2026
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
