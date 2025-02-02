// src/components/team/team-management.tsx -->

"use client";

import { useState } from 'react';
import { TeamMemberList } from './team-member-list';
import { InviteMemberDialog } from './invite-member-dialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export function TeamManagement() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <TeamMemberList />
      
      <InviteMemberDialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
      />
    </div>
  );
}