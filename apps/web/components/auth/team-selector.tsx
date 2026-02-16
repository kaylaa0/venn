'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@kit/ui/command';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import { cn } from '@kit/ui/utils';

interface Team {
  id: string;
  name: string;
}

export type TeamSelection =
  | { mode: 'join'; team_id: string; teamName: string }
  | { mode: 'create'; name: string };

export function TeamSelector({
  value,
  onChange,
}: {
  value: TeamSelection | null;
  onChange: (selection: TeamSelection | null) => void;
}) {
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch teams on mount
  useEffect(() => {
    async function load() {
      setLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('teams')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setTeams(data);
      setLoading(false);
    }

    load();
  }, [supabase]);

  // Display label for the trigger button
  const displayLabel = useMemo(() => {
    if (!value) return 'Select a team…';

    if (value.mode === 'join') {
      return value.teamName;
    }

    return `Create: ${value.name}`;
  }, [value]);

  const handleSelectTeam = (team: Team) => {
    onChange({ mode: 'join', team_id: team.id, teamName: team.name });
    setIsCreating(false);
    setOpen(false);
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setNewTeamName('');
    onChange(null);
    setOpen(false);
  };

  const handleConfirmCreate = () => {
    if (newTeamName.trim()) {
      onChange({ mode: 'create', name: newTeamName.trim() });
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewTeamName('');
    onChange(null);
  };

  // Creating a new team — inline input
  if (isCreating) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">New Team Name</Label>

        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="e.g. Venn Vanguards"
            value={newTeamName}
            onChange={(e) => {
              setNewTeamName(e.target.value);
              if (e.target.value.trim()) {
                onChange({ mode: 'create', name: e.target.value.trim() });
              } else {
                onChange(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmCreate();
              }
            }}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 px-3"
            onClick={handleCancelCreate}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Default — searchable dropdown
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Team</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
            )}
            type="button"
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search teams…" />

            <CommandList>
              <CommandEmpty>
                {loading ? 'Loading teams…' : 'No teams found.'}
              </CommandEmpty>

              <CommandGroup heading="Existing Teams">
                {teams.map((team) => (
                  <CommandItem
                    key={team.id}
                    value={team.name}
                    onSelect={() => handleSelectTeam(team)}
                    className="cursor-pointer"
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        value?.mode === 'join' && value.team_id === team.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {team.name}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup>
                <CommandItem
                  onSelect={handleStartCreating}
                  className="cursor-pointer"
                >
                  <PlusCircledIcon className="mr-2 h-4 w-4" />
                  Create a new team
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
