import Header from "@/components/header";

export default async function ProfileDetails({ params }: ParamsWithSearch) {
  const { id } = await params;

  return (
    <div className="wrapper page">
      <Header
        title="Dilshod Rofiyev | rof1yev"
        subHeader="rofiyevdilshod@gmail.com"
      />

      <h1 className="text-2xl font-karla">USER {id}</h1>
    </div>
  );
}
