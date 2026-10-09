import React from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { ShieldAlert, Lock, Sprout } from 'lucide-react';

export const PlaceholderPage = ({ title }) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>{title}</span>
          <Badge variant="sky">Upcoming Feature</Badge>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          School ERP Module Preview
        </p>
      </div>

      <Card ecoBorder={true} className="max-w-2xl mx-auto my-8 text-center p-8">
        <div className="w-16 h-16 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          {title} Module Coming Soon
        </h3>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          The features for <strong>{title}</strong> are being configured for your school workspace.
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-ecoGreen-700 font-medium">
          <Sprout className="w-4 h-4" />
          <span>School System Active & Ready</span>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
