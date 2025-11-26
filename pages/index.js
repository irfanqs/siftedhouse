export async function getServerSideProps() {
    return { redirect: { destination: '/select-items', permanent: false } };
  }
  export default function Index() { return null; }
  