'use client';

import { useRouter } from 'next/navigation';
import CharacterCreator, {
  type PlayerChoices,
} from './CharacterCreator';
import { WELCOME_TOUR_COMPLETED_KEY, WELCOME_TOUR_PENDING_KEY, game, removeMigratedLocalStorage } from '../utils/Store';
import { createPlayerHomeInfo } from '../zoned/Interior/playerHomeInfo';
import { HOMES } from './CharacterData';

export default function CharacterCreationPage() {
  const router = useRouter();

  async function handleComplete(choices: PlayerChoices) {
    const loadingStartedAt = Date.now();
    const customization = {
      Look: choices.appearance,
      Personality: choices.traits,
      Dream: choices.dream,
      'Birth Lottery': choices.birthOutcome,
      Home: choices.home,
    };

    try {
      localStorage.setItem(
        'freetown-life-player-customization',
        JSON.stringify(customization),
      );
      localStorage.setItem(
        'freetown-life-player-appearance',
        JSON.stringify(choices.appearance),
      );
      localStorage.setItem(
        'freetown-life-player-choices',
        JSON.stringify(choices),
      );
      localStorage.setItem(WELCOME_TOUR_PENDING_KEY, 'true');
      removeMigratedLocalStorage(WELCOME_TOUR_COMPLETED_KEY);
    } catch {
      // Continue into the game if storage is unavailable.
    }

    const homeChoice = HOMES.find((option) => option.name === choices.home) ?? HOMES[0];
    const playerHome = createPlayerHomeInfo(homeChoice);

    game.setPlayer(choices.appearance);
    game.setDream(choices.dream);
    game.setCharacterSetup({
      traits: choices.traits,
      birthOutcome: choices.birthOutcome,
      home: choices.home,
    });
    game.setPlayerHome(playerHome);
    game.enter(playerHome);

    const saveResponse = await fetch('/api/player/save', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game.getSave()),
    });
    if (!saveResponse.ok) {
      const result = await saveResponse.json().catch(() => null);
      throw new Error(result?.error ?? 'Could not save your choices to your account. Check your connection and try again.');
    }

    const minimumLoadingMs = 700;
    const remainingLoadingMs = minimumLoadingMs - (Date.now() - loadingStartedAt);
    if (remainingLoadingMs > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remainingLoadingMs));
    }

    router.replace('/');
  }

  return <CharacterCreator onComplete={handleComplete} />;
}
