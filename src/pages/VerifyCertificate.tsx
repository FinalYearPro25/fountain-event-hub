import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyCertificate() {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("certificates")
        .select("*, user:profiles(name), event:events(name, date)")
        .eq("verification_code", code)
        .single();
      if (data) setCert(data);
      setLoading(false);
    };
    fetchCert();
  }, []);

  if (loading)
    return <div className="p-8 text-center">Verifying certificate...</div>;

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 border rounded shadow text-center">
      {cert ? (
        <>
          <div className="text-2xl font-bold text-green-700 mb-2">
            Certificate Verified
          </div>
          <div className="mb-4 text-gray-700">
            This certificate is valid and was issued to:
          </div>
          <div className="text-lg font-semibold">
            {cert.user?.name || cert.user_id}
          </div>
          <div className="text-gray-600">for participation in</div>
          <div className="font-medium">{cert.event?.name || cert.event_id}</div>
          <div className="text-gray-500 mt-2">
            Date: {cert.event?.date || cert.issued_at?.slice(0, 10)}
          </div>
        </>
      ) : (
        <div className="text-xl font-bold text-red-600">
          Certificate Not Found or Invalid
        </div>
      )}
    </div>
  );
}
