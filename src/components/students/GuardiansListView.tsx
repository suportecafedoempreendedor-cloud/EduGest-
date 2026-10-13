import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  ChevronRight,
  Edit2,
  CheckCircle2,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Guardian, Student, GuardianStudentRelation } from '../../types';

interface GuardiansListViewProps {
  guardians: Guardian[];
  students: Student[];
  relations: GuardianStudentRelation[];
  onOpenNewGuardian: () => void;
  onEditGuardian: (guardian: Guardian) => void;
  onSelectStudentProfile: (student: Student) => void;
  onOpenAssociateEducando?: (guardian: Guardian) => void;
}

export const GuardiansListView: React.FC<GuardiansListViewProps> = ({
  guardians,
  students,
  relations,
  onOpenNewGuardian,
  onEditGuardian,
  onSelectStudentProfile,
  onOpenAssociateEducando,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGuardians = guardians.filter((g) => {
    const term = searchTerm.toLowerCase();
    return (
      g.nome.toLowerCase().includes(term) ||
      g.documento.toLowerCase().includes(term) ||
      g.telefone.toLowerCase().includes(term) ||
      g.email.toLowerCase().includes(term) ||
      g.profissao.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <Card noPadding>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-bold text-[#012041]">
              Registo de Encarregados de Educação
            </h2>
            <p className="text-xs text-[#41515D]">
              {guardians.length} tutores registados · Gestão de relações multi-educandos (`guardian_students`)
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenNewGuardian}
          >
            Novo Encarregado
          </Button>
        </div>

        <div className="p-4 bg-slate-50/50">
          <Input
            placeholder="Pesquisar encarregado por Nome, BI, Telefone ou Profissão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </Card>

      {/* Guardians Grid */}
      {filteredGuardians.length === 0 ? (
        <Card noPadding>
          <div className="p-8 text-center text-xs text-[#41515D]">
            Nenhum encarregado encontrado com os termos pesquisados.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuardians.map((guardian) => {
            // Find all students associated with this guardian
            const guardianRelations = relations.filter(
              (r) => r.guardianId === guardian.id
            );
            const associatedStudents = guardianRelations
              .map((rel) => {
                const st = students.find((s) => s.id === rel.studentId);
                return st ? { student: st, rel } : null;
              })
              .filter(Boolean) as {
              student: Student;
              rel: GuardianStudentRelation;
            }[];

            return (
              <Card key={guardian.id} className="hover:border-slate-300 transition-colors">
                <div className="space-y-4 text-xs">
                  {/* Top: Name, Document and Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#012041]">{guardian.nome}</h3>
                        <Badge variant="neutral">{guardian.grauParentescoPrincipal}</Badge>
                      </div>
                      <span className="text-[11px] text-[#41515D] font-mono block mt-0.5">
                        BI: {guardian.documento} ({guardian.tipoDocumento})
                      </span>
                    </div>

                    <button
                      onClick={() => onEditGuardian(guardian)}
                      className="p-1.5 rounded-lg text-[#012041] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Editar Encarregado"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[#41515D] text-[11px] block">Contacto</span>
                      <span className="font-mono font-semibold text-[#012041] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#015FC4]" />
                        {guardian.telefone}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#41515D] text-[11px] block">Profissão</span>
                      <span className="font-medium text-[#012041] flex items-center gap-1 mt-0.5 truncate">
                        <Briefcase className="w-3 h-3 text-[#41515D]" />
                        {guardian.profissao}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[#41515D] text-[11px] block">Correio Electrónico</span>
                      <span className="text-[#012041] flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="w-3 h-3 text-[#015FC4]" />
                        {guardian.email}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[#41515D] text-[11px] block">Morada</span>
                      <span className="text-[#012041] flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-[#41515D]" />
                        {guardian.morada}
                      </span>
                    </div>
                  </div>

                  {/* Associated Students Section (guardian_students) */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#012041] uppercase tracking-wide flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-[#015FC4]" />
                        Educandos Associados ({associatedStudents.length})
                      </span>
                      <div className="flex items-center gap-2">
                        {associatedStudents.length > 1 && (
                          <span className="text-[10px] bg-blue-50 text-[#015FC4] px-1.5 py-0.5 rounded font-semibold">
                            Múltiplos Filhos
                          </span>
                        )}
                        {onOpenAssociateEducando && (
                          <button
                            onClick={() => onOpenAssociateEducando(guardian)}
                            className="text-[11px] font-semibold text-[#015FC4] hover:underline flex items-center gap-1 cursor-pointer"
                            title="Associar mais um educando a este encarregado"
                          >
                            <Plus className="w-3 h-3" />
                            Associar
                          </button>
                        )}
                      </div>
                    </div>

                    {associatedStudents.length === 0 ? (
                      <p className="text-[11px] text-[#41515D] italic">
                        Nenhum educando associado a este tutor no momento.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {associatedStudents.map(({ student, rel }) => (
                          <div
                            key={student.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-semibold text-[#012041] truncate">
                                  {student.nomeCompleto}
                                </span>
                                <span className="text-[10px] text-[#015FC4] font-medium">
                                  ({rel.grauParentesco})
                                </span>
                                {rel.isPrincipal && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#41515D] font-mono block">
                                {student.numeroMatricula || student.processo} · {student.classe} ({student.turmaNome})
                              </span>
                            </div>

                            <button
                              onClick={() => onSelectStudentProfile(student)}
                              className="text-xs font-semibold text-[#015FC4] hover:text-[#012041] flex items-center gap-0.5 shrink-0 cursor-pointer"
                              title="Abrir Perfil do Aluno"
                            >
                              Ver Perfil
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
