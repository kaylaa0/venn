'use client';

import { Loader2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { UpdateTeamImageForm } from './update-team-image-form';
import { UpdateTeamNameForm } from './update-team-name-form';
import { useTeamData } from './use-team-data';

export function TeamSettingsContainer() {
  const team = useTeamData();

  if (team.isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (team.error || !team.data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Could not load team data. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={'flex w-full flex-col space-y-4'}>
      <Card>
        <CardHeader>
          <CardTitle>Team Avatar</CardTitle>
          <CardDescription>
            Upload an image that represents your team across Venn
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateTeamImageForm
            teamId={team.data.id}
            pictureUrl={team.data.picture_url}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Name</CardTitle>
          <CardDescription>
            This is the name that will be displayed on your posts and profile
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateTeamNameForm
            teamId={team.data.id}
            currentName={team.data.name}
          />
        </CardContent>
      </Card>
    </div>
  );
}
