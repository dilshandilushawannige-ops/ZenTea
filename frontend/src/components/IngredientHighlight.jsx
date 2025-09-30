const IngredientHighlight = () => {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 lg:flex-row lg:items-start lg:justify-between lg:px-12">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#0b6b3c]">by taste</p>
          <h3 className="text-4xl font-semibold text-[#0b6b3c] whitespace-pre-line">
            {`We scour the globe\nfor the finest organic ingredients`}
          </h3>
        </div>
        <p className="max-w-xl text-16 leading-relaxed text-[#0b6b3c]/85 lg:ml-16">
          Each blend is a herbal symphony of organic herbs and ingredients, uniquely blended to create a range of herbal teas that celebrate the wonder of nature. All of our products are certified organic and made with the highest quality herbs and ingredients, masterfully blended to create a range of unique tasting infusions to enjoy from rise to rest.
        </p>
      </div>
    </section>
  );
};

export default IngredientHighlight;

