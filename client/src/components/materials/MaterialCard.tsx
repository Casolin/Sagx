import type { Material } from "../../types/global.types";

interface Props {
  material: Material;
}

const MaterialCard = ({ material }: Props) => {
  const failureTypes = material.failureTypes ?? [];
  const hasFailures = failureTypes.length > 0;

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
            {material.name}
          </h2>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {material.description?.trim()
              ? material.description
              : "No description available"}
          </p>
        </div>

        {/* Quantity badge */}
        <span className="shrink-0 text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
          {material.quantity} {material.unit}
        </span>
      </div>

      {/* Failure tags */}
      <div className="mt-4">
        {hasFailures ? (
          <div className="flex flex-wrap gap-2">
            {failureTypes.map((type, idx) => (
              <span
                key={`${type}-${idx}`}
                className="text-xs font-medium bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full"
              >
                {type}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">
            No failure types recorded
          </p>
        )}
      </div>
    </div>
  );
};

export default MaterialCard;
