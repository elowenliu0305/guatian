import { useNavigate } from 'react-router-dom'
import Canvas from '../components/Canvas'

interface HomePageProps {
  createTopicDraft?: string;
  onDraftConsumed?: () => void;
  onTopicDetailChange?: (inDetail: boolean) => void;
}

export default function HomePage({ createTopicDraft, onDraftConsumed, onTopicDetailChange }: HomePageProps) {
  const navigate = useNavigate()

  return <Canvas onNavigate={navigate} createTopicDraft={createTopicDraft} onDraftConsumed={onDraftConsumed} onTopicDetailChange={onTopicDetailChange} />
}
