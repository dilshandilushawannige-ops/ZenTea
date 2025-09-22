export default function PayslipCard({ slip, onDownload }) {
  return (
    <div className="p-3 border rounded flex justify-between items-center text-sm">
      <div>
        <div className="font-medium">{slip.month}</div>
        <div className="text-gray-500">Slip #{slip.slipNo}</div>
      </div>
      <button
        onClick={() => onDownload(slip.slipNo)}
        className="text-emerald-700 underline"
      >
        Download
      </button>
    </div>
  );
}
