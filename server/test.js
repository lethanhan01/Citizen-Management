import 'dotenv/config';
import supabase from './src/config/supabase.js'; // ❗ KHÔNG có {}

const getPersons = async () => {
  const { data, error } = await supabase
    .schema('core')
    .from('person')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  console.log(data);
};

getPersons();
