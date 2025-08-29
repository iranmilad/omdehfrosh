import Attributes from "../attributes";

function SummaryEntry({ data }) {
  
  return (
    <>
      <div className="text-zinc-700 text-lg md:text-xl">
        {data.general.title}
      </div>
      <div className="text-zinc-400 text-xs mt-4">
        {data.general.english_title}
      </div>
      <Attributes items={data?.options} />
    </>
  );
}

export default SummaryEntry;
