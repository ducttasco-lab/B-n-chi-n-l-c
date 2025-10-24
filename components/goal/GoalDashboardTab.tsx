// components/goal/GoalDashboardTab.tsx
import React, { useState, useMemo } from 'react';
import { Goal, Department, Role, KPI } from '../../types.ts';
import { MOCK_PREDEFINED_KPIS } from '../../constants.tsx';

interface GoalDashboardTabProps {
    goals: Goal[];
    departments: Department[];
    roles: Role[];
}

const GoalDashboardTab: React.FC<GoalDashboardTabProps> = ({ goals, departments, roles }) => {
    const [filter, setFilter] = useState<{ type: 'company' | 'dept' | 'emp'; code: string }>({ type: 'company', code: '__ALL__' });

    const filteredGoals = useMemo(() => {
        if (filter.type === 'company' || !filter.code) return goals;
        if (filter.type === 'dept') {
            return goals.filter(g => g.departmentCode === filter.code);
        }
        return goals.filter(g => g.employeeId === filter.code);
    }, [goals, filter]);

    const allKpis = useMemo(() => filteredGoals.flatMap(g => g.kpis), [filteredGoals]);

    const overallProgress = useMemo(() => {
        if (allKpis.length === 0) return 0;
        const totalProgress = allKpis.reduce((sum, kpi) => sum + kpi.progress, 0);
        return totalProgress / allKpis.length;
    }, [allKpis]);

    const completedKpis = useMemo(() => allKpis.filter(kpi => kpi.progress >= 1).length, [allKpis]);

    const getMetricSummary = (category: 'Doanh thu' | 'Doanh số' | 'Dòng tiền') => {
        const relevantKpiCodes = MOCK_PREDEFINED_KPIS.filter(pk => pk.category === category).map(pk => pk.code);
        const relevantKpis = allKpis.filter(kpi => relevantKpiCodes.includes(kpi.kpiCode));
        
        if (relevantKpis.length === 0) {
            return { actual: 0, target: 0, unit: '' };
        }

        const unit = relevantKpis[0].unit; // Assume all KPIs in a category have the same unit
        const actual = relevantKpis.reduce((sum, kpi) => sum + kpi.actual, 0);
        const target = relevantKpis.reduce((sum, kpi) => sum + kpi.target, 0);
        
        return { actual, target, unit };
    };

    const revenueSummary = getMetricSummary('Doanh thu');
    const salesSummary = getMetricSummary('Doanh số');
    const cashFlowSummary = getMetricSummary('Dòng tiền');

    const rankingData = useMemo(() => {
        if (filter.type === 'company') { // Rank departments
            return departments.map(dept => {
                const deptGoals = goals.filter(g => g.departmentCode === dept.code);
                const deptKpis = deptGoals.flatMap(g => g.kpis);
                const avgProgress = deptKpis.length > 0 ? deptKpis.reduce((sum, k) => sum + k.progress, 0) / deptKpis.length : 0;
                return { name: dept.name, progress: avgProgress };
            }).sort((a, b) => b.progress - a.progress);
        }
        if (filter.type === 'dept') { // Rank employees in department
             const staffInDept = roles.filter(r => r.departmentCode === filter.code);
             return staffInDept.map(staff => {
                const empGoals = goals.filter(g => g.employeeId === staff.id);
                const empKpis = empGoals.flatMap(g => g.kpis);
                const avgProgress = empKpis.length > 0 ? empKpis.reduce((sum, k) => sum + k.progress, 0) / empKpis.length : 0;
                return { name: staff.name, progress: avgProgress };
             }).sort((a, b) => b.progress - a.progress);
        }
        return []; // No ranking for individual view
    }, [filter, goals, departments, roles]);


    return (
        <div className="p-4 h-full flex flex-col space-y-4 bg-slate-50">
            <div className="flex-shrink-0 flex items-center gap-4">
                <label className="font-semibold">Xem báo cáo cho:</label>
                <select 
                    onChange={e => {
                        const [type, code] = e.target.value.split('|');
                        setFilter({ type: type as any, code });
                    }}
                    className="p-2 border border-slate-300 rounded-md bg-white shadow-sm"
                >
                    <option value="company|__ALL__">Toàn công ty</option>
                    {departments.map(dept => (
                        <optgroup key={dept.code} label={dept.name}>
                            <option value={`dept|${dept.code}`}>{`Toàn bộ ${dept.name}`}</option>
                            {roles.filter(r => r.departmentCode === dept.code).map(role => (
                                <option key={role.id} value={`emp|${role.id}`}>{role.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Progress Card */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h4 className="font-bold text-slate-600">Tiến độ Chung</h4>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{(overallProgress * 100).toFixed(1)}%</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${overallProgress * 100}%`}}></div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Hoàn thành: {completedKpis} / {allKpis.length} KPIs</p>
                </div>
                 {/* Revenue Card */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h4 className="font-bold text-slate-600">Doanh thu</h4>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {revenueSummary.actual.toLocaleString()}
                        <span className="text-lg text-slate-500 font-normal"> / {revenueSummary.target.toLocaleString()} {revenueSummary.unit}</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Thực tế so với Kế hoạch</p>
                </div>
                 {/* Sales Card */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h4 className="font-bold text-slate-600">Doanh số</h4>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {salesSummary.actual.toLocaleString()}
                         <span className="text-lg text-slate-500 font-normal"> / {salesSummary.target.toLocaleString()} {salesSummary.unit}</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Thực tế so với Kế hoạch</p>
                </div>
                 {/* Cash Flow Card */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h4 className="font-bold text-slate-600">Dòng tiền</h4>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {cashFlowSummary.actual.toLocaleString()}
                        <span className="text-lg text-slate-500 font-normal"> / {cashFlowSummary.target.toLocaleString()} {cashFlowSummary.unit}</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Thực tế so với Kế hoạch</p>
                </div>
            </div>

            {rankingData.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h4 className="font-bold text-slate-600 mb-2">
                        {filter.type === 'company' ? 'Xếp hạng Hiệu suất theo Phòng ban' : 'Xếp hạng Hiệu suất Cá nhân'}
                    </h4>
                    <div className="space-y-2">
                        {rankingData.map((item, index) => (
                             <div key={item.name} className="flex items-center">
                                <span className="w-6 font-bold text-slate-500">#{index + 1}</span>
                                <span className="w-48 truncate">{item.name}</span>
                                <div className="flex-1 bg-slate-200 rounded-full h-5">
                                    <div className="bg-blue-500 h-5 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ width: `${Math.min(100, item.progress * 100)}%`}}>
                                        {(item.progress * 100).toFixed(0)}%
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalDashboardTab;