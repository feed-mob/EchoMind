import MoodCenter from './MoodCenter';
import NewSources from './NewSources';

export default function MoodSpaceSidebar() {
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-6">
      <MoodCenter />
      <NewSources />
    </aside>
  );
}
