import Image from "next/image";

const ImgComponent = ({ src, alt }) => {
  return (
    <div className="not-prose break-inside-avoid-page">
      <Image
        src={`${src}`}
        alt={alt}
        width={800}
        height={400}
        className="mx-auto rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      {alt && (
        <p className="pt-2 text-center font-sans text-sm opacity-80">
          {alt}
        </p>
      )}
    </div>
  );
};

export default ImgComponent;
