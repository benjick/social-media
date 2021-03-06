import React from 'react';

import { Layout } from '../components/Layout';
import { AuthWrapper } from '../components/AuthWrapper';
import { Profile } from '.prisma/client';
import { useUser } from '../lib/hooks/useUser';
import { Avatar } from '../components/Avatar';
import { createAuthServerSideProps } from '../lib/auth';

function Profile() {
  const user = useUser();

  if (typeof user === 'undefined') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8 mt-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form
            className="divide-y divide-gray-200 lg:col-span-9"
            action="#"
            method="POST"
          >
            {/* Profile section */}
            <div className="py-6 px-4 sm:p-6 lg:pb-8">
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Profile
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This information will be displayed publicly so be careful what
                  you share.
                </p>
              </div>

              <div className="mt-6 flex flex-col lg:flex-row">
                <div className="flex-grow space-y-6">
                  <div>
                    <div className="block text-sm font-medium text-gray-700">
                      Username
                    </div>
                    <div
                      className="bg-gray-50 mt-1 border-solid border-1 border-black py-2 rounded-md shadow-sm flex"
                      border-gray-300
                    >
                      <div className="px-3 inline-flex items-center text-gray-500 sm:text-sm">
                        @{user.username}:socialmedia.com
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="about"
                      className="block text-sm font-medium text-gray-700"
                    >
                      About
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="about"
                        name="about"
                        rows={3}
                        className="shadow-sm focus:ring-sky-500 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                        defaultValue={''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex-grow lg:mt-0 lg:ml-6 lg:flex-grow-0 lg:flex-shrink-0">
                  <p
                    className="text-sm font-medium text-gray-700"
                    aria-hidden="true"
                  >
                    Photo
                  </p>
                  <div className="mt-1 lg:hidden">
                    <div className="flex items-center">
                      {user.profile.image ? (
                        <div
                          className="flex-shrink-0 inline-block rounded-full overflow-hidden h-12 w-12"
                          aria-hidden="true"
                        >
                          <img
                            className="rounded-full h-full w-full"
                            src={user.profile.image}
                            alt=""
                          />
                        </div>
                      ) : (
                        <Avatar name={user.profile.name} size="small" />
                      )}

                      <div className="ml-5 rounded-md shadow-sm">
                        <div className="group relative border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500">
                          <label
                            htmlFor="mobile-user-photo"
                            className="relative text-sm leading-4 font-medium text-gray-700 pointer-events-none"
                          >
                            <span>Change</span>
                            <span className="sr-only"> user photo</span>
                          </label>
                          <input
                            id="mobile-user-photo"
                            name="user-photo"
                            type="file"
                            className="absolute w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden relative rounded-full overflow-hidden lg:block">
                    {user.profile.image ? (
                      <img
                        className="relative rounded-full w-40 h-40"
                        src={user.profile.image}
                        alt=""
                      />
                    ) : (
                      <Avatar name={user.profile.name} size="big" />
                    )}
                    <label
                      htmlFor="desktop-user-photo"
                      className="absolute inset-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center text-sm font-medium text-white opacity-0 hover:opacity-100 focus-within:opacity-100"
                    >
                      <span>Change</span>
                      <span className="sr-only"> user photo</span>
                      <input
                        type="file"
                        id="desktop-user-photo"
                        name="user-photo"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-12 gap-6">
                <div className="col-span-12">
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={user.profile.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default AuthWrapper(Profile);

export const getServerSideProps = createAuthServerSideProps();
