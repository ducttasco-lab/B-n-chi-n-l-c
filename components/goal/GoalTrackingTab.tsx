// components/goal/GoalTrackingTab.tsx
import React, { useState, useMemo } from 'react';
import { Goal, Department, Role, KPI, TrackingEntry } from '../../types.ts';
import { getWeekDates, getWeekDisplay, getDayDisplay, areDatesSameDay, getMonthGrid, getMonthDisplay } from '../../utils/dateUtils.ts';

// Modal for adding/editing a check-in
interface CheckInModalProps {
    kpi: KPI;
    date: Date;
    onClose: () => void;
    onSave: (kpiId: string, newEntry: TrackingEntry) => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ kpi, date, onClose, onSave }) => {
    const latestEntryForDay = kpi.history.find(h => areDatesSameDay(new Date(h.date), date));
    const [value, setValue] = useState<number>(latestEntryForDay?.value ?? kpi.actual);
    const [comment, setComment] = useState(latestEntryForDay?.comment ?? '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: TrackingEntry = {
            id: latestEntryForDay?.id || `entry-${Date.now()}`,
            date: date.toISOString(),
            value,
            comment,
        };
        onSave(kpi.kpiId, newEntry);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold mb-2">Ghi nhận Tiến độ ngày {date.toLocaleDateString('vi-VN')}</h2>
                <p className="text-sm text-slate-600 border-b pb-2">KPI: {kpi.description}</p>
                <div>
                    <label className="block text-sm font-medium">Giá trị thực tế mới:</label>
                    <input type="number" step="any" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Ghi chú (tùy chọn):</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
                </div>
            </form>
        </div>
    );
};


interface GoalTrackingTabProps {
    goals: Goal[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    departments: Department[];
    roles: Role[];
}

const GoalTrackingTab: React.FC<GoalTrackingTabProps> = ({ goals, setGoals, departments, roles }) => {
    const [filter, setFilter] = useState<{ type: 'dept' | 'emp'; code: string }>({ type: 'dept', code: departments[0]?.code });
    const [checkingIn, setCheckingIn] = useState<{kpi: KPI, date: Date} | null>(null);
    const [viewMode, setViewMode] = useState<'year' | 'month' | 'week' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    const filteredGoals = useMemo(() => {
        if (!filter || !filter.code) return [];
        if (filter.type === 'dept') {
            return goals.filter(g => g.departmentCode === filter.code);
        }
        return goals.filter(g => g.employeeId === filter.code);
    }, [goals, filter]);

    const handleSaveCheckIn = (kpiId: string, newEntry: TrackingEntry) => {
        setGoals(prevGoals => prevGoals.map(goal => {
            const kpiIndex = goal.kpis.findIndex(k => k.kpiId === kpiId);
            if (kpiIndex === -1) return goal;

            const updatedKpi = { ...goal.kpis[kpiIndex] };
            
            const existingEntryIndex = updatedKpi.history.findIndex(h => h.id === newEntry.id || areDatesSameDay(new Date(h.date), new Date(newEntry.date)));
            if (existingEntryIndex > -1) {
                updatedKpi.history[existingEntryIndex] = newEntry;
            } else {
                 updatedKpi.history.push(newEntry);
            }
            
            updatedKpi.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            updatedKpi.actual = updatedKpi.history[0]?.value ?? updatedKpi.baseline;
            
            const progress = (updatedKpi.target - updatedKpi.baseline) === 0 
                ? (updatedKpi.actual >= updatedKpi.target ? 1 : 0)
                : (updatedKpi.actual - updatedKpi.baseline) / (updatedKpi.target - updatedKpi.baseline);
            updatedKpi.progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1

            const newKpis = [...goal.kpis];
            newKpis[kpiIndex] = updatedKpi;
            return { ...goal, kpis: newKpis };
        }));
    };
    
    const changeDate = (amount: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            if (viewMode === 'day') newDate.setDate(newDate.getDate() + amount);
            if (viewMode === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
            if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + amount);
            if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + amount);
            return newDate;
        });
    };

    const renderContent = () => {
        switch(viewMode) {
            case 'day': return <DailyView goals={filteredGoals} date={currentDate} onCheckInClick={(kpi, date) => setCheckingIn({kpi, date})} />;
            case 'week': return <WeeklyView goals={filteredGoals} date={currentDate} onCheckInClick={(kpi, date) => setCheckingIn({kpi, date})} />;
            case 'month': return <MonthlyView goals={filteredGoals} date={currentDate} onCheckInClick={(kpi, date) => setCheckingIn({kpi, date})} />;
            case 'year':
            default: return <YearlyView goals={filteredGoals} />;
        }
    }

    return (
        <div className="p-4 h-full flex flex-col space-y-4 bg-slate-50">
            {checkingIn && <CheckInModal kpi={checkingIn.kpi} date={checkingIn.date} onClose={() => setCheckingIn(null)} onSave={handleSaveCheckIn}/>}
            
            <div className="flex-shrink-0 flex flex-wrap items-center gap-4">
                {/* Filters */}
                <div className="flex items-center space-x-2">
                    <label className="font-semibold">Xem theo:</label>
                    <select 
                        onChange={e => {
                            const [type, code] = e.target.value.split('|');
                            setFilter({ type: type as any, code });
                        }}
                        className="p-2 border border-slate-300 rounded-md bg-white shadow-sm"
                    >
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

                <div className="flex items-center space-x-2 border-l pl-4">
                     <label className="font-semibold">Chế độ xem:</label>
                     <div className="flex rounded-md shadow-sm bg-white border">
                        {(['year', 'month', 'week', 'day'] as const).map(mode => (
                             <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1.5 text-sm ${viewMode === mode ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'} first:rounded-l-md last:rounded-r-md`}>
                                {mode === 'year' ? 'Năm' : mode === 'month' ? 'Tháng' : mode === 'week' ? 'Tuần' : 'Ngày'}
                            </button>
                        ))}
                     </div>
                </div>
                
                 {/* Date Navigation */}
                <div className="flex items-center space-x-2">
                     <button onClick={() => changeDate(-1)} className="p-2 rounded-md hover:bg-slate-200">{'<'}</button>
                     <span className="font-semibold text-blue-700 w-40 text-center">
                        {viewMode === 'day' && getDayDisplay(currentDate)}
                        {viewMode === 'week' && getWeekDisplay(currentDate)}
                        {viewMode === 'month' && getMonthDisplay(currentDate)}
                        {viewMode === 'year' && `Năm ${currentDate.getFullYear()}`}
                    </span>
                     <button onClick={() => changeDate(1)} className="p-2 rounded-md hover:bg-slate-200">{'>'}</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {renderContent()}
            </div>
        </div>
    );
};

// Yearly View Component
const YearlyView: React.FC<{goals: Goal[]}> = ({ goals }) => {
    if (goals.length === 0) return <div className="text-center text-slate-500 p-8">Không có mục tiêu nào cho lựa chọn này.</div>;
    
    return (
        <>
            {goals.map(goal => {
                const avgProgress = goal.kpis.length > 0 ? goal.kpis.reduce((sum, k) => sum + k.progress, 0) / goal.kpis.length : 0;
                return (
                    <div key={goal.goalId} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                        <h4 className="font-bold text-blue-800">{goal.goalDescription}</h4>
                        <p className="text-sm text-slate-500 mb-2">Nhân viên: {goal.employeeName} | Nhiệm vụ: {goal.linkedTaskName}</p>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <div className="w-full bg-slate-200 rounded-full h-5">
                                    <div className="bg-green-500 h-5 rounded-full" style={{ width: `${Math.min(100, avgProgress * 100)}%` }} />
                                </div>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-sm">
                                    {(avgProgress * 100).toFixed(0)}%
                                </span>
                            </div>
                            <span className="text-sm font-semibold">{goal.kpis.length} KPIs</span>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

// Monthly View Component
const MonthlyView: React.FC<{goals: Goal[], date: Date, onCheckInClick: (kpi: KPI, date: Date) => void}> = ({ goals, date, onCheckInClick }) => {
    const monthGrid = getMonthGrid(date);
    const kpis = goals.flatMap(g => g.kpis.map(kpi => ({ ...kpi, goal: g })));
    
    const getValueForDay = (kpi: KPI, day: Date) => {
        const entriesOnOrBefore = kpi.history
            .filter(h => new Date(h.date) <= new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return entriesOnOrBefore[0]?.value ?? kpi.baseline;
    };

    if (kpis.length === 0) return <div className="text-center text-slate-500 p-8">Không có KPI nào để theo dõi trong tháng này.</div>;

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-center border-collapse">
                 <thead className="bg-slate-100">
                    <tr>
                        <th className="p-2 border-b text-left w-[25%] font-semibold">KPI</th>
                        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map(day => 
                            <th key={day} className="p-2 border-b font-semibold">{day}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                {kpis.map(kpi => (
                    <React.Fragment key={kpi.kpiId}>
                         <tr className="bg-slate-50 font-semibold text-slate-700">
                            <td colSpan={8} className="p-2 border-b text-left">
                                <p>{kpi.description}</p>
                                <p className="font-normal text-slate-500">{kpi.goal.employeeName}</p>
                            </td>
                         </tr>
                         {monthGrid.map((week, weekIndex) => (
                             <tr key={weekIndex} className="hover:bg-slate-50">
                                 <td className="p-2 border-b font-semibold text-slate-500">Giá trị</td>
                                 {week.map(day => {
                                     const isCurrentMonth = day.getMonth() === date.getMonth();
                                     return (
                                         <td key={day.toISOString()} onClick={() => onCheckInClick(kpi, day)} className={`p-2 border-b cursor-pointer hover:bg-blue-100 ${!isCurrentMonth ? 'text-slate-300 bg-slate-50' : ''}`}>
                                             <span className="block text-xs text-center">{day.getDate()}</span>
                                             <span className="font-semibold">{getValueForDay(kpi, day).toLocaleString()}</span>
                                         </td>
                                     )
                                 })}
                             </tr>
                         ))}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};


// Weekly View Component
const WeeklyView: React.FC<{goals: Goal[], date: Date, onCheckInClick: (kpi: KPI, date: Date) => void}> = ({ goals, date, onCheckInClick }) => {
    const weekDates = getWeekDates(date);
    const kpis = goals.flatMap(g => g.kpis.map(kpi => ({ ...kpi, goal: g })));

    const getValueForDay = (kpi: KPI, day: Date) => {
        const entriesOnOrBefore = kpi.history
            .filter(h => new Date(h.date) <= new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return entriesOnOrBefore[0]?.value ?? kpi.baseline;
    };
    
    if (kpis.length === 0) return <div className="text-center text-slate-500 p-8">Không có KPI nào để theo dõi trong tuần này.</div>;

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-center border-collapse">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="p-2 border-b text-left w-1/4 font-semibold">KPI</th>
                        {weekDates.map(d => <th key={d.toISOString()} className="p-2 border-b font-semibold">{d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit' })}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {kpis.map(kpi => (
                        <tr key={kpi.kpiId} className="hover:bg-slate-50">
                            <td className="p-2 border-b text-left">
                                <p className="font-semibold">{kpi.description}</p>
                                <p className="text-slate-500">{kpi.goal.employeeName}</p>
                            </td>
                            {weekDates.map(day => (
                                <td key={day.toISOString()} onClick={() => onCheckInClick(kpi, day)} className="p-2 border-b cursor-pointer hover:bg-blue-100">
                                    {getValueForDay(kpi, day).toLocaleString()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Daily View Component
const DailyView: React.FC<{goals: Goal[], date: Date, onCheckInClick: (kpi: KPI, date: Date) => void}> = ({ goals, date, onCheckInClick }) => {
     const kpis = goals.flatMap(g => g.kpis.map(kpi => ({ ...kpi, goal: g })));
     if (kpis.length === 0) return <div className="text-center text-slate-500 p-8">Không có KPI nào để theo dõi trong ngày này.</div>;

    return (
        <div className="space-y-4">
        {kpis.map(kpi => {
            const dailyEntries = kpi.history.filter(h => areDatesSameDay(new Date(h.date), date));
            return (
                 <div key={kpi.kpiId} className="bg-white border border-slate-200 rounded-lg shadow-sm p-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{kpi.description}</p>
                             <p className="text-sm text-slate-500">{kpi.goal.employeeName}</p>
                        </div>
                        <button onClick={() => onCheckInClick(kpi, date)} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Thêm Check-in</button>
                    </div>
                    <div className="mt-2 border-t pt-2">
                        {dailyEntries.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                            {dailyEntries.map(entry => (
                                <li key={entry.id} className="flex justify-between p-1 rounded">
                                    <span className="text-slate-500">{new Date(entry.date).toLocaleTimeString('vi-VN')}</span>
                                    <span className="font-bold">{entry.value.toLocaleString()} {kpi.unit}</span>
                                    <span className="italic text-slate-600 truncate flex-1 ml-4">{entry.comment}</span>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400 italic text-center p-2">Chưa có check-in nào trong ngày.</p>
                        )}
                    </div>
                </div>
            );
        })}
        </div>
    );
}

export default GoalTrackingTab;