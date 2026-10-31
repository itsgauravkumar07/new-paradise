import Image from "next/image";

const NewHero = () => {
  return (
    <>
      <section className="relative bg-white overflow-hidden bg-cover bg-center bg-no-repeat min-h-[500px] xs:min-h-[550px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] xl:min-h-[750px]">
        <div className="absolute inset-0 z-0 -top-16 left-[104px] -right-20 -bottom-8">
          <Image
            src="/hero/HeroBg.webp"
            alt="Travel background"
            fill
            sizes="(max-width: 640px) 150vw, (max-width: 1024px) 130vw, 120vw"
            className="object-cover lg:object-contain alpha"
            priority={false}
          />
        </div>
        <div className="relative z-10 mx-auto w-full px-3 xs:px-4 sm:px-6 md:px-8 lg:px-16 xl:px-12 py-6 xs:py-8 sm:py-12 md:py-16 lg:py-10 xl:py-18">
          <div className=" grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[650px_auto] gap-4 xs:gap-6 sm:gap-8 md:gap-10 lg:gap-8 xl:gap-10 items-stretch mt-16 xs:mt-20 sm:mt-24 md:mt-12 lg:mt-0 xl:mt-0 lg:mr-[-10%] xl:mr-[-15%] h-full min-h-full">
            <div className="text-center lg:text-left lg:w-[90%] lg:px-32 xl:px-32 h-full min-h-full flex flex-col justify-center">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Explore the World&apos;s{" "}
                <span className="text-blue-400">Secret</span> Treasures
              </h1>
              <p className="mt-4 sm:mt-6 text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-full lg:max-w-[90%] xl:max-w-[90%]">
                Embark on unforgettable journeys to places where beauty meets
                mystery. From ancient cities to breathtaking landscapes,
                discover destinations that will leave you inspired and amazed
              </p>
            </div>

            <div className="relative h-full min-h-[700px] xs:min-h-[750px] sm:min-h-[800px] md:min-h-[850px] lg:min-h-[900px] xl:min-h-[750px] mx-auto max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-none w-full lg:left-[-20%]">
              <div className="absolute left-[-110px] xs:left-14 sm:left-16 md:left-18 lg:right-[-80%] xl:right-[-80%] top-16 xs:top-18 sm:top-20 md:top-22 lg:top-20 xl:top-22 w-[120px] xs:w-[140px] sm:w-[160px] md:w-[180px] lg:w-[320px] xl:w-[320px] h-[200px] xs:h-[230px] sm:h-[250px] md:h-[270px] lg:h-[440px] xl:h-[440px] rounded-2xl lg:rounded-3xl overflow-hidden">
                <Image
                  src={"/hero/Hero1.webp"}
                  alt="Travel destination showcase"
                  fill
                  sizes="(max-width: 640px) 160px, (max-width: 768px) 200px, (max-width: 1024px) 320px, 320px"
                  className="object-cover"
                  priority={false}
                />
              </div>

              <div className=" abz absolute right-40 xs:right-4 sm:right-6 md:right-8 lg:left-[-10%] xl:right-[-38%] top-[300px] xs:top-[220px] sm:top-[250px] md:top-[270px] lg:top-[200px] xl:top-[170px] w-[400px] xs:w-[250px] sm:w-[300px] md:w-[330px] lg:w-[220px] xl:w-[240px] h-[350px] xs:h-[250px] sm:h-[300px] md:h-[330px] lg:h-[220px] xl:h-[240px] rounded-2xl lg:rounded-3xl overflow-hidden">
                <Image
                  src={"/hero/AI2.png"}
                  alt="AI travel assistant"
                  fill
                  sizes="(max-width: 640px) 250px, (max-width: 768px) 300px, (max-width: 1024px) 220px, 240px"
                  className="object-contain"
                  priority={false}
                />
              </div>

              <div className="qwerty  absolute left-[-80px] xs:left-[-72px] sm:left-[-64px] md:left-[-56px] lg:right-[-5%] xl:right-[30%] top-[320px] xs:top-[360px] sm:top-[400px] md:top-[440px] lg:top-[440px] xl:top-[460px] w-[380px] xs:w-[410px] sm:w-[450px] md:w-[480px] lg:w-[350px] xl:w-[380px] h-[380px] xs:h-[410px] sm:h-[450px] md:h-[480px] lg:h-[350px] xl:h-[380px] rounded-2xl lg:rounded-3xl overflow-hidden">
                <Image
                  src={"/hero/AI1.png"}
                  alt="AI travel assistant 2"
                  fill
                  sizes="(max-width: 640px) 380px, (max-width: 768px) 450px, (max-width: 1024px) 350px, 380px"
                  className="object-contain"
                  priority={false}
                />
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2 xs:left-1/2 sm:left-1/2 md:left-1/2 lg:left-[68%] xl:right-[-20%] top-[300px] xs:top-[320px] sm:top-[340px] md:top-[360px] lg:top-14 w-[100px] xs:w-[110px] sm:w-[130px] md:w-[150px] lg:w-[260px] xl:w-[260px] h-[140px] xs:h-[155px] sm:h-[180px] md:h-[200px] lg:h-[320px] xl:h-[320px] rounded-2xl lg:rounded-3xl overflow-hidden">
                <Image
                  src={"/hero/Hero2.webp"}
                  alt="Beautiful landscape"
                  fill
                  sizes="(max-width: 640px) 100px, (max-width: 768px) 130px, (max-width: 1024px) 260px, 260px"
                  className="object-cover"
                  priority={false}
                />
              </div>

              <div className="anatomy absolute left-1/2 transform -translate-x-1/2 xs:left-1/2 sm:left-1/2 md:left-1/2 lg:left-[68%] xl:right-[-20%] top-[480px] xs:top-[500px] sm:top-[520px] md:top-[540px] lg:top-[400px] xl:top-[420px] w-[100px] xs:w-[110px] sm:w-[130px] md:w-[150px] lg:w-[260px] xl:w-[260px] h-[140px] xs:h-[155px] sm:h-[180px] md:h-[200px] lg:h-[260px] xl:h-[260px] rounded-2xl lg:rounded-3xl overflow-hidden">
                <Image
                  src={"/hero/Hero3.webp"}
                  alt="Adventure destination"
                  fill
                  sizes="(max-width: 640px) 100px, (max-width: 768px) 130px, (max-width: 1024px) 260px, 260px"
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NewHero;
