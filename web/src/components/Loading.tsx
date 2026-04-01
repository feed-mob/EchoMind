interface LoadingProps {
  text?: string | null;
  showIcon?: boolean;
  position?: string;
}

export default function Loading({
  text='Loading ...',
  showIcon=true,
  position='fixed',
}:LoadingProps) {
  return(
    <div className={`${position} top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 flex flex-col items-center justify-center z-50`}>
      <div className="bg-white py-6 px-8 rounded-lg min-w-60 flex flex-col items-center justify-center gap-5">
        {text && (
          <div className="text-slate-700 font-medium text-2xl">
            {text}
          </div>
        )}
        {showIcon && (<div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-primary mx-auto"></div>
        </div>)}
      </div>
    </div>
  )
}