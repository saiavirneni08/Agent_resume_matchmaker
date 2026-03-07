import Header from "@/components/Header";
import AgentForm from "@/components/AgentForm";

type AgentPageProps = {
  params: {
    agentId: string;
  };
};

export default function AgentPage({ params }: AgentPageProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[900px] p-6 md:py-12">
      <Header />
      <AgentForm agentId={params.agentId} />
    </main>
  );
}
