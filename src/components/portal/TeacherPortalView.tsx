import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Send,
  Edit2,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Student, NotaItem } from '../../types';

interface TeacherPortalViewProps {
  teacherName: string;
  students: Student[];
  notas: NotaItem[];
  schoolName: string;
  onNavigateToPedagogical: () => void;
}

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  teacherName,
  students,
  notas,
  schoolName,
  onNavigateToPedagogical,
}) => {
  const turmasAtribuidas = [
    {
      id: 't-10cfb-a',
      nome: '10ª Classe - Turma A',
      curso: 'Ciências Físicas e Biológicas',
      disciplina: 'Matemática',
      totalAlunos: 24,
      periodo: 'Manhã',
      sala: 'Sala 04',
      pautaEstado: 'Em Lançamento (2º Trimestre)',
    },
    {
      id: 't-11info-b',
      nome: '11ª Classe - Turma B',
      curso: 'Informática de Gestão',
      disciplina: 'F.A.I. / Algoritmos',
      totalAlunos: 28,
      periodo: 'Tarde',
      sala: 'Laboratório 2',
      pautaEstado: 'Pendente Submissão',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Oficial do Docente */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] rounded-xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <span>{schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>Portal do Professor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bem-vindo, {teacherName}
            </h1>
            <p className="text-xs text-blue-100">
              Gestão de turmas curriculares, lançamento de avaliações (MAC, NPP, NPT) e registo de presenças.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            icon={<FileSpreadsheet className="w-4 h-4 text-[#015FC4]" />}
            onClick={onNavigateToPedagogical}
            className="bg-white text-[#012041] hover:bg-blue-50 font-bold"
          >
            Abrir Grelha de Lançamento de Notas
          </Button>
        </div>
      </div>

      {/* Turmas Atribuídas ao Docente */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-[#012041]">
              Minhas Turmas Atribuídas no Ano Lectivo 2025/2026
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Consulte os estudantes matriculados e inicie a pauta de avaliação de cada turma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turmasAtribuidas.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-xl border border-gray-200 bg-white hover:border-[#015FC4] transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#015FC4]">
                      {t.disciplina}
                    </span>
                    <span className="text-xs text-gray-500">{t.periodo} · {t.sala}</span>
                  </div>

                  <h3 className="font-bold text-base text-[#012041] mt-1">{t.nome}</h3>
                  <span className="text-xs text-gray-500 block">{t.curso}</span>

                  <div className="pt-3 border-t border-gray-100 mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Alunos Inscritos:</span>
                      <strong className="text-gray-900">{t.totalAlunos} Alunos</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Estado da Pauta:</span>
                      <strong className="text-amber-700">{t.pautaEstado}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={onNavigateToPedagogical}
                  >
                    Lançar Notas desta Turma
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
