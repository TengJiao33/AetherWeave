import { memo } from 'react';
import { DEMAND_TYPE_MAP } from '../constants/map';

interface HoverInfoProps {
    hoverInfo: any;
}

const HoverTooltip = memo(function HoverTooltip({ hoverInfo }: HoverInfoProps) {
    if (!hoverInfo || !hoverInfo.object || !hoverInfo.object.properties) return null;

    const props = hoverInfo.object.properties;
    const hasName = props.name && props.name.trim() !== '';
    const typeKey = props.type || '';
    const hasValidType = typeKey !== '' && DEMAND_TYPE_MAP[typeKey] !== undefined;

    if (!hasName && !hasValidType) return null;

    return (
        <div
            className="absolute top-0 left-0 z-[60] pointer-events-none px-3 py-2 bg-slate-800/95 text-white text-sm rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)] flex flex-col gap-1.5 backdrop-blur-sm border border-slate-700/50 transition-opacity"
            style={{ transform: `translate3d(${hoverInfo.x + 15}px, ${hoverInfo.y + 15}px, 0)` }}
        >
            {hasName && (
                <div className="font-bold text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
                    {props.name}
                </div>
            )}
            {hasValidType && (() => {
                const typeInfo = DEMAND_TYPE_MAP[typeKey];
                const IconComponent = typeInfo.Icon;
                return (
                    <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <IconComponent size={14} className="text-emerald-400" />
                        <span>{typeInfo.label}</span>
                    </div>
                );
            })()}
        </div>
    );
}
);

export default HoverTooltip;
