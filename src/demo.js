import React, { StrictMode } from 'react';
import JsonViewer from './JsonViewer';
import { useForm, Controller } from "react-hook-form";


const defaultValues = {
  venueAddress: {
    addressLine1: '33 Nightmare Street',
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



  const { handleSubmit, reset, setValue, control } = useForm({ defaultValues });
  const [data, setData] = React.useState(null)


  return (
    <form onSubmit={handleSubmit((data) => setData(data))} className="form">
    <Controller
      name="venueAddress"
      control={control}
      render={({ field }) => (
      
        <JsonViewer
          title={'Venue Address'}
          data={field.value}
          onChange={(e) => field.onChange(e.target.venueAddress)}
          />
      )}/>

    </form>
  );
}

<Controller
name="Checkbox"
control={control}
render={({ field }) => (
  <Checkbox
    onChange={(e) => field.onChange(e.target.checked)}
    checked={field.value}
  />
)}
/>