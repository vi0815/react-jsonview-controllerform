import React, { StrictMode } from 'react';
import JsonViewer from './JsonViewer';
import { useForm, Controller } from "react-hook-form";


const defaultValues = {
  venueAddress: {
    addressLine1: '66 Nightmare Street',
    postCode: '7BQ 918',
    city: 'Edinburgh',
  }
}

export default function DemoJsonViewer() {
  const [exampleData, setExampleData] = React.useState({
    addressLine1: '33 Nightmare Street',
    postCode: '7BQ 918',
    city: 'Edinburgh',
  });



  const { handleSubmit, reset, setValue, control } = useForm({ defaultValues,
  mode: "onSubmit" });
  const [data, setData] = React.useState(null)


  return (
    <form onSubmit={handleSubmit((data) => setData(data))} className="form">
    <Controller
      name="venueAddress"
      control={control}
      rules={{
        validate: (e) => {false}
        }
      }
      render={({ field }) => (
        <JsonViewer
          title={'Venue Address'}
          data={field.value}
          onChange={(e) => {
            field.onChange(e.result)}}
          />
      )}/>

    <button>Test Submit</button>
    <div>

      Return data from JsonViewer
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
    </form>
  );
}
